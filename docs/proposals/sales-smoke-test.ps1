<#
  Smoke test FE → BE cho nhóm SALES: gọi qua Next.js (BFF) như trình duyệt, kiểm tra từng bước trả đúng mã HTTP.

  Yêu cầu: Backend đang chạy (BACKEND_API_URL của FE trỏ tới nó), DB đã migrate + seed (`migrator all`), FE chạy ở $Base.
  Cách chạy:
    pwsh -File docs/proposals/sales-smoke-test.ps1 -AdminEmail admin@example.com -AdminPassword '<mật khẩu SuperAdmin>'
  Script chỉ THÊM dữ liệu có hậu tố ngẫu nhiên (món/mã giảm giá/khách "smoke-xxxx") và bật phương thức chuyển khoản mẫu —
  chạy trên DB test/dev, không chạy trên DB thật của cửa hàng.
#>
param(
  [string]$Base = "http://localhost:3000",
  [Parameter(Mandatory = $true)][string]$AdminEmail,
  [Parameter(Mandatory = $true)][string]$AdminPassword
)

$ErrorActionPreference = "Stop"
$script:Failures = 0
$suffix = -join ((97..122) | Get-Random -Count 6 | ForEach-Object { [char]$_ })

function Invoke-Step {
  param([string]$Name, [string]$Method, [string]$Path, $Body = $null, $Session, [int[]]$Expect = @(200, 201, 204))
  $params = @{ Uri = "$Base$Path"; Method = $Method; WebSession = $Session; UseBasicParsing = $true; ContentType = "application/json" }
  # Gửi UTF-8 (Windows PowerShell 5.1 mặc định mã hóa chuỗi body kiểu ISO-8859-1 làm hỏng tiếng Việt).
  if ($null -ne $Body) { $params.Body = [System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 12 -Compress)) }
  $status = 0; $content = $null
  try {
    $response = Invoke-WebRequest @params
    $status = [int]$response.StatusCode; $content = $response.Content
  } catch {
    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode
      try { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $content = $reader.ReadToEnd() } catch { $content = $null }
    } else { $status = -1; $content = $_.Exception.Message }
  }
  $ok = $Expect -contains $status
  if (-not $ok) { $script:Failures++ }
  Write-Host ("{0} {1,-62} {2,4} {3}" -f $(if ($ok) { "PASS" } else { "FAIL" }), $Name, $status, $(if (-not $ok -and $content) { $content.Substring(0, [Math]::Min(220, $content.Length)) } else { "" }))
  if ($content) { try { return ($content | ConvertFrom-Json) } catch { return $null } }
  return $null
}

$admin = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$guest = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$customer = New-Object Microsoft.PowerShell.Commands.WebRequestSession

"== Admin đăng nhập"
$null = Invoke-Step "admin login" POST "/api/admin/auth/login" @{ email = $AdminEmail; password = $AdminPassword } $admin -Expect 200

"== Cấu hình (Admin CRUD qua BFF)"
$delivery = Invoke-Step "delivery-methods create" POST "/api/admin/backend/sales/delivery-methods" @{ code = "smoke-$suffix"; name = "Smoke giao"; type = "delivery"; baseFee = 15000; freeShippingThreshold = 500000; displayOrder = 90; isActive = $true; isDefault = $false } $admin -Expect 201
$null = Invoke-Step "delivery-methods list" GET "/api/admin/backend/sales/delivery-methods?pageSize=200" $null $admin -Expect 200
$null = Invoke-Step "delivery-methods update" PUT "/api/admin/backend/sales/delivery-methods/$($delivery.id)" @{ name = "Smoke giao (sửa)"; type = "delivery"; baseFee = 15000; freeShippingThreshold = 500000; displayOrder = 90; isActive = $true; isDefault = $false } $admin -Expect 200
$cod = Invoke-Step "payment-methods create (cod)" POST "/api/admin/backend/sales/payment-methods" @{ code = "smoke-cod-$suffix"; name = "Smoke COD"; group = "cod"; displayOrder = 90; isActive = $true; isDefault = $false } $admin -Expect 201
$transfer = Invoke-Step "payment-methods create (bank_transfer)" POST "/api/admin/backend/sales/payment-methods" @{ code = "smoke-ck-$suffix"; name = "Smoke chuyển khoản"; group = "bank_transfer"; bankName = "Vietcombank"; bankAccountNumber = "0123456789"; bankAccountHolder = "SMOKE"; displayOrder = 91; isActive = $true; isDefault = $false } $admin -Expect 201
$group = Invoke-Step "order-option-groups create" POST "/api/admin/backend/sales/order-option-groups" @{ name = "Rau smoke $suffix"; selectionType = "single"; isRequired = $true; options = @(@{ id = $null; label = "Tiêu chuẩn"; priceAdjustment = 0; isDefault = $true }, @{ id = $null; label = "Thêm rau"; priceAdjustment = 5000; isDefault = $false }) } $admin -Expect 201
$null = Invoke-Step "order-settings get" GET "/api/admin/backend/sales/order-settings" $null $admin -Expect 200
$null = Invoke-Step "order-settings update" PUT "/api/admin/backend/sales/order-settings" @{ orderCodePrefix = "TH127"; orderCodeDateFormat = "yyMMdd"; orderCodeSequenceLength = 5; paymentSessionMinutes = 15 } $admin -Expect 200

"== Site đọc cấu hình công khai (qua /api/sales)"
$null = Invoke-Step "public delivery-methods" GET "/api/sales/public/delivery-methods" $null $guest -Expect 200
$null = Invoke-Step "public payment-methods" GET "/api/sales/public/payment-methods" $null $guest -Expect 200
$null = Invoke-Step "public order-options" GET "/api/sales/public/order-options" $null $guest -Expect 200
$catalog = Invoke-Step "public catalog" GET "/api/catalog/public" $null $guest -Expect 200
$product = $catalog.products | Select-Object -First 1
if (-not $product) { throw "Catalog trống — chạy migrator seed trước." }
$optionValue = $group.options[1].id

"== Mã giảm giá (Admin tạo, khách kiểm tra)"
$code = "SMOKE$($suffix.ToUpper())"
$promotion = Invoke-Step "promotion create" POST "/api/admin/backend/catalog/promotions" @{ code = $code; name = "Smoke 10%"; type = "percentage"; value = 10; usageLimit = 5; status = "active" } $admin -Expect 201
$validated = Invoke-Step "promotion validate (site)" POST "/api/catalog/promotions/validate" @{ code = $code; subtotal = 105000; shippingFee = 15000; items = @(@{ productId = $product.id; lineTotal = 100000 }) } $guest -Expect 200
if (-not $validated.isValid) { "FAIL promotion validate isValid=false"; $script:Failures++ }

$items = @(@{ productId = $product.id; quantity = 2 })
$options = @(@{ groupId = $group.id; optionId = $optionValue })
function New-OrderBody($paymentCode, $discountCode) {
  @{ customerName = "Khách Smoke"; phone = "0901234567"; deliveryAddress = "12 Đinh Tiên Hoàng, Q1"; deliveryMethodCode = "smoke-$suffix"; paymentMethodCode = $paymentCode; items = $items; wantsUtensils = $true; orderOptions = $options; discountCode = $discountCode; idempotencyKey = [guid]::NewGuid().ToString("n") }
}

"== Đơn COD của khách vãng lai"
$order = Invoke-Step "order create (COD + mã giảm giá)" POST "/api/sales/public/orders" (New-OrderBody "smoke-cod-$suffix" $code) $guest -Expect 201
"  → mã đơn $($order.orderCode), tổng $($order.totalAmount)đ, giảm $($order.discount)đ"
$null = Invoke-Step "order create refuses transfer method" POST "/api/sales/public/orders" (New-OrderBody "smoke-ck-$suffix" $null) $guest -Expect 400
$null = Invoke-Step "order lookup (code + phone)" POST "/api/sales/public/orders/lookup" @{ orderCode = $order.orderCode; phone = "+84 901 234 567" } $guest -Expect 200
$null = Invoke-Step "order lookup wrong phone → 404" POST "/api/sales/public/orders/lookup" @{ orderCode = $order.orderCode; phone = "0909999999" } $guest -Expect 404
$null = Invoke-Step "staff endpoint blocked for guest" GET "/api/sales/orders" $null $guest -Expect 404
$null = Invoke-Step "admin orders list" GET "/api/admin/backend/sales/orders?pageSize=200&status=pending" $null $admin -Expect 200
foreach ($step in "confirmed", "preparing", "ready", "delivering", "completed") {
  $null = Invoke-Step "admin order → $step" POST "/api/admin/backend/sales/orders/$($order.id)/status" @{ toStatus = $step } $admin -Expect 200
}
$null = Invoke-Step "admin payment → paid" POST "/api/admin/backend/sales/payments/$($order.paymentId)/transition" @{ toStatus = "paid"; note = "đã thu tiền" } $admin -Expect 200
$null = Invoke-Step "admin payments list" GET "/api/admin/backend/sales/payments?pageSize=200" $null $admin -Expect 200
$null = Invoke-Step "admin payment transactions" GET "/api/admin/backend/sales/payments/$($order.paymentId)/transactions" $null $admin -Expect 200

"== Phiên thanh toán QR (nhân viên xác nhận)"
$session = Invoke-Step "payment-session create" POST "/api/sales/public/payment-sessions" (New-OrderBody "smoke-ck-$suffix" $null) $guest -Expect 201
$null = Invoke-Step "payment-session poll (pending)" GET "/api/sales/public/payment-sessions/$($session.id)" $null $guest -Expect 200
$null = Invoke-Step "admin payment-sessions list" GET "/api/admin/backend/sales/payment-sessions?status=pending" $null $admin -Expect 200
$confirmed = Invoke-Step "admin payment-session confirm → tạo đơn" POST "/api/admin/backend/sales/payment-sessions/$($session.id)/confirm" @{} $admin -Expect 200
"  → phiên success, đơn $($confirmed.orderCode)"
$null = Invoke-Step "order lookup after confirm" POST "/api/sales/public/orders/lookup" @{ orderCode = $confirmed.orderCode; phone = "0901234567" } $guest -Expect 200
$session2 = Invoke-Step "payment-session #2 create" POST "/api/sales/public/payment-sessions" (New-OrderBody "smoke-ck-$suffix" $null) $guest -Expect 201
$null = Invoke-Step "admin payment-session reject" POST "/api/admin/backend/sales/payment-sessions/$($session2.id)/reject" @{ note = "Chưa thấy tiền" } $admin -Expect 200
$null = Invoke-Step "customer retry session" POST "/api/sales/public/payment-sessions/$($session2.id)/retry" @{} $guest -Expect 200
$null = Invoke-Step "customer cancel session" POST "/api/sales/public/payment-sessions/$($session2.id)/cancel" @{} $guest -Expect 200

"== Khách có tài khoản (đăng ký / phiên / lịch sử đơn)"
$email = "smoke-$suffix@example.com"
# Số điện thoại tài khoản phải duy nhất → ngẫu nhiên mỗi lần chạy (script chạy lại được nhiều lần).
$customerPhone = "09" + (Get-Random -Minimum 10000000 -Maximum 99999999)
$null = Invoke-Step "customer register" POST "/api/customer/auth/register" @{ fullName = "Khách Smoke"; phone = $customerPhone; email = $email; password = "Smoke-Passw0rd!"; confirmPassword = "Smoke-Passw0rd!" } $customer -Expect 201
$null = Invoke-Step "customer session" GET "/api/customer/session" $null $customer -Expect 200
$mine = Invoke-Step "customer order create (linked)" POST "/api/sales/public/orders" (New-OrderBody "smoke-cod-$suffix" $null) $customer -Expect 201
$history = Invoke-Step "customer order history" GET "/api/sales/customer/orders" $null $customer -Expect 200
if (-not ($history.items | Where-Object { $_.orderCode -eq $mine.orderCode })) { "FAIL history misses the order"; $script:Failures++ }
$null = Invoke-Step "customer order by code" GET "/api/sales/customer/orders/$($mine.orderCode)" $null $customer -Expect 200
$null = Invoke-Step "customer history needs login → 401" GET "/api/sales/customer/orders" $null $guest -Expect 401
$null = Invoke-Step "customer logout" POST "/api/customer/auth/logout" @{} $customer -Expect 200
$afterLogout = Invoke-Step "customer session after logout (user = null)" GET "/api/customer/session" $null $customer -Expect 200
if ($null -ne $afterLogout.data.user) { Write-Host "FAIL session still has a user after logout"; $script:Failures++ }

"== Hủy đơn hoàn lại lượt mã giảm giá"
$cancelOrder = Invoke-Step "order create (COD + code) to cancel" POST "/api/sales/public/orders" (New-OrderBody "smoke-cod-$suffix" $code) $guest -Expect 201
$null = Invoke-Step "admin order → cancelled" POST "/api/admin/backend/sales/orders/$($cancelOrder.id)/status" @{ toStatus = "cancelled"; note = "smoke" } $admin -Expect 200

"== Dọn dẹp dữ liệu smoke"
$null = Invoke-Step "promotion delete" DELETE "/api/admin/backend/catalog/promotions/$($promotion.id)" $null $admin -Expect 204
$null = Invoke-Step "order-option-groups delete" DELETE "/api/admin/backend/sales/order-option-groups/$($group.id)" $null $admin -Expect 204
$null = Invoke-Step "payment-methods delete (transfer)" DELETE "/api/admin/backend/sales/payment-methods/$($transfer.id)" $null $admin -Expect 204
$null = Invoke-Step "payment-methods delete (cod)" DELETE "/api/admin/backend/sales/payment-methods/$($cod.id)" $null $admin -Expect 204
$null = Invoke-Step "delivery-methods delete" DELETE "/api/admin/backend/sales/delivery-methods/$($delivery.id)" $null $admin -Expect 204

""
if ($script:Failures -eq 0) { "TẤT CẢ BƯỚC ĐỀU ĐÚNG MÃ HTTP." } else { "$script:Failures BƯỚC SAI." ; exit 1 }
