# Nền tảng: Permission phân cấp + Navigation hợp nhất (Admin + Website)

Trạng thái: **ĐỀ XUẤT KIẾN TRÚC / SCHEMA — chưa triển khai code.** Chờ xác nhận mục 6.
Phạm vi: chỉ 2 nghiệp vụ này (module AccessControl + Navigation ở BE; `features/permissions`, `features/roles`,
`features/admin-menus`, `features/navigation` + Header/Footer/AdminSidebar ở FE). Ngoài phạm vi: không đụng.

---

## 0. Hiện trạng (đã đọc code)

**Permission** — `AccessControl`, schema `access_control`

- Bảng `permissions(id, code UNIQUE, name, is_active, audit…)` — **phẳng**, không cha/con.
- `role_permissions(role_id, permission_id)`.
- Quyền vào JWT = các `permissions.code` (active) của các role active (`RolePermissionQueryService`); `PermissionAuthorizationHandler` so khớp **đúng chuỗi code**.
- Catalog quyền nằm trong code: mỗi module có `XxxPermissions.All`, gom ở `Migrator/PermissionCatalog.cs`, seed idempotent theo `code` (`AccessControlSeeder`).
- FE `RoleEditor` nhóm theo tiền tố code bằng hàm cứng `groupPermissionsByDomain` (`useRoleEditor.ts`), tick từng quyền lẻ.

**Navigation** — `Navigation`, schema `navigation`

- `menus(id, code UNIQUE, name, parent_id, route, icon, sort_order, is_active)` — cây tự tham chiếu, **chỉ cho Admin sidebar**.
- `menu_permissions(menu_id, permission_code)` — lưu **code chuỗi**, không FK sang AccessControl (có chủ đích: kiến trúc cấm module này tham chiếu module kia; `ModuleBoundaryTests`).
- Ẩn/hiện: menu hiện nếu không có dòng quyền hoặc người gọi có **ít nhất 1** code; nhóm không route và không còn con hiển thị thì ẩn (`MyNavigationService`).
- API: `GET /navigation/menus` (sidebar đã lọc quyền); CRUD `/menus` + `/menus/{id}/permissions` (`menus.*`).
- **Navigation Site (Header/Footer/Mobile) KHÔNG có ở BE** — FE đang mock localStorage (`features/navigation`, `createMockStore`, `navigation.api.ts` chuyển mock/real bằng `getApiMode`). Mock có thêm khái niệm container (`location` header/footer/mobile) và `targetType` page/route/external, `openInNewTab`, `isVisible`.

---

## 1. Nguyên tắc thiết kế

1. **Giữ nguyên cơ chế kiểm quyền hiện tại**: JWT chỉ chứa code **lá**; handler so khớp chuỗi. Không đổi `PermissionAuthorizationHandler`, không đổi JWT.
2. **Không FK chéo module**: Navigation tiếp tục lưu `permission_code` (chuỗi).
3. **Bảng chung cho phần giống nhau, bảng chi tiết cho phần chỉ một bên dùng** (theo yêu cầu): tránh cột NULL rải rác và tránh nhân đôi bảng.
4. **An toàn mặc định**: thêm quyền con mới không tự cấp cho role cũ; Site navigation có gắn quyền thì endpoint công khai tự ẩn.
5. **Idempotent seed + migration giữ dữ liệu Render** (đổi tên bảng/cột, không drop).

---

## 2. PHẦN 1 — Permission phân cấp

### 2.1 Quyết định cốt lõi: nhóm là nút cấu trúc, KHÔNG phải quyền cấp được

|                               | Nhóm (`is_group = true`)                         | Quyền lá (`is_group = false`)           |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------- |
| Là gì                       | Nút gom trong cây, để hiển thị & chọn nhanh  | Quyền thật, có `code` kiểm tra ở API |
| Có con                       | Có (nhóm hoặc lá),**nhiều cấp tùy ý** | **Không**                            |
| Ghi vào `role_permissions` | **Không**                                    | Có                                         |
| Vào JWT                      | **Không**                                    | Có                                         |

Chọn nhóm trong UI = chọn **mọi lá con cháu hiện có** tại thời điểm lưu (cascade). Hệ quả: kiểm quyền không đổi, không cần truy vấn đệ quy khi login, và quyền con thêm sau **không** tự cấp cho role cũ (admin phải tick lại → least privilege).

Phương án đã loại: *lưu cả nhóm vào `role_permissions` rồi suy diễn con lúc đăng nhập* (cấp tự động quyền mới, phải đổi JWT/handler/đệ quy mỗi login).

### 2.2 Schema (một bảng, mở rộng `permissions`)

```
access_control.permissions            -- BẢNG CHUNG cho nhóm + lá
  id            uuid PK
  code          varchar(150) UNIQUE NOT NULL   -- lá: "orders.view" (giữ nguyên) ; nhóm: "grp:orders" (tiền tố cố định, không bao giờ trùng code lá)
  name          varchar(200) NOT NULL
  parent_id     uuid NULL  FK -> permissions.id  ON DELETE RESTRICT   -- MỚI
  is_group      boolean NOT NULL DEFAULT false                         -- MỚI
  sort_order    int NOT NULL DEFAULT 0                                 -- MỚI
  is_active, audit…, row_version (giữ)
  INDEX (parent_id, sort_order)
  CHECK ( parent_id IS NULL OR parent_id <> id )

access_control.role_permissions       -- GIỮ NGUYÊN (chỉ chứa permission_id của LÁ)
```

Không tách bảng ở phần này: nhóm và lá cùng một cây `parent_id` nhiều cấp, một bảng + một tự FK là gọn nhất; tách bảng sẽ buộc FK đa hình cho cha. Bảng chi tiết duy nhất có thể thêm sau (không cần ngay): `permission_details(permission_id, description, risk_level)` nếu cần mô tả dài.

### 2.3 Quy tắc (validate ở service + domain)

- Cha phải là nhóm (`is_group = true`); lá không được có con.
- Chống vòng lặp (duyệt tổ tiên khi đổi `parent_id`); độ sâu tối đa 5 (hằng số, đổi được).
- Đổi lá → nhóm chỉ khi lá chưa nằm trong `role_permissions`; nhóm → lá chỉ khi không còn con.
- Xóa nhóm còn con → 409. Tắt nhóm (`is_active=false`) → ẩn khỏi cây chọn nhưng **không** tắt quyền lá (tắt từng lá nếu muốn).
- Nhóm không bao giờ xuất hiện trong claim JWT, `RolePermissionQueryService` thêm `AND is_group = false` (phòng dữ liệu sai).

### 2.4 API (module AccessControl)

- `PermissionResponse` thêm `parentId`, `isGroup`, `sortOrder`. `Create/UpdatePermissionRequest` thêm `parentId`, `isGroup` (create), `sortOrder`.
- **Mới** `GET /api/v1/permissions/tree` (`permissions.view`): cây lồng nhau `{id, code, name, isGroup, sortOrder, children[]}`, chỉ active.
- `PUT /roles/{id}/permissions` (giữ chữ ký `permissionIds`): server **chuẩn hóa** — nếu nhận id nhóm thì mở rộng thành mọi lá con cháu; id không tồn tại vẫn 400; luôn lưu chỉ lá.
- `GET /roles/{id}/permissions` trả id **lá** (FE tự tính nhóm tick/indeterminate từ cây).

### 2.5 FE

- `features/permissions`: type thêm `parentId/isGroup/sortOrder`; Explorer hiển thị dạng cây (cột cấp, badge Nhóm); Editor có chọn **Nhóm cha** (chỉ liệt kê nhóm) + công tắc "Là nhóm" (khóa khi sửa nếu vi phạm quy tắc).
- `features/roles`: thay `groupPermissionsByDomain` (**hard-code theo tiền tố — xóa**) bằng `PermissionTree` dùng `GET /permissions/tree`: checkbox 3 trạng thái (checked / indeterminate / unchecked); tick nhóm = tick/bỏ mọi lá con cháu; lưu danh sách id lá. Component dùng chung, không phụ thuộc feature khác (đặt `features/permissions`, export qua barrel, `roles` import qua barrel).
- Giữ nguyên `hasPermission(code)` (chỉ lá).

### 2.6 Seed & migration

- Migration `AccessControl_AddPermissionHierarchy`: thêm 3 cột + index + CHECK; **không đổi dữ liệu cũ**.
- Seed (trong `AccessControlSeeder`, idempotent, upsert theo `code`):
  - Danh sách nhóm khai báo ở `Migrator/PermissionCatalog` (`PermissionGroupSeed(Code, Name, ParentCode, SortOrder)`), 2 cấp mặc định bám sidebar: **Module** (Hệ thống, Tổ chức, Sales, Catalog, Content, SEO, Cấu hình…) → **Tài nguyên** (users, roles, orders, products…).
  - Gắn lá vào nhóm theo bảng ánh xạ rõ ràng `leaf code prefix → group code` (không đoán ngầm); lá chưa map vào nhóm "Khác" để không mất.
  - Seeder chỉ **đồng bộ cấu trúc** (`parent_id`, `sort_order`, `is_group`) cho dòng do seed sở hữu, không ghi đè `name`/`is_active` đã chỉnh bởi admin (cùng cách `NavigationSeeder` đang làm).
- Role hiện có giữ nguyên quyền; SuperAdmin vẫn được gán mọi **lá** (không gán nhóm).

---

## 3. PHẦN 2 — Navigation hợp nhất (Admin + Website)

### 3.1 Cái gì dùng chung / cái gì tách

| Thành phần                                                                        | Dùng chung?                                                 | Bảng                               |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| Container menu (Admin sidebar, Site header/footer/mobile)                           | Chung                                                        | `navigation_menus`                |
| Nút điều hướng (cây, nhãn, link, icon, thứ tự, ẩn/hiện, nhóm)           | **Chung**                                              | `navigation_items`                |
| Thuộc tính chỉ Website (loại đích page/route/external, id page, mở tab mới) | **Tách** (chi tiết)                                  | `navigation_item_site_details`    |
| Gán quyền truy cập                                                               | Chung (generic cho mọi scope)                               | `navigation_item_permissions`     |
| Quyền (permission)                                                                 | **Không nhân bản** — chỉ lưu `permission_code` | tham chiếu mềm tới AccessControl |

Lý do tách `site_details`: Admin không có `target_type/target_id/open_in_new_tab`; để chung thì mọi dòng admin mang 3 cột NULL, và validate theo scope rối. Bảng chi tiết 1–0..1 chỉ tồn tại cho item thuộc menu `SITE`.
Không tách thêm `admin_details`: phần Admin dùng đúng các cột chung (route = `url`, icon).

### 3.2 Schema (schema `navigation`)

```
navigation.navigation_menus            -- CONTAINER (thay cho khái niệm "location" của mock)
  id          uuid PK
  code        varchar(100) UNIQUE NOT NULL      -- "admin-sidebar", "site-header", "site-footer", "site-mobile"
  name        varchar(200) NOT NULL
  scope       varchar(20)  NOT NULL             -- 'ADMIN' | 'SITE'          (bất biến sau khi tạo)
  location    varchar(30)  NOT NULL             -- 'sidebar' | 'header' | 'footer' | 'mobile'  (bất biến)
  is_active, audit…, row_version
  UNIQUE (scope, location)                      -- mỗi vị trí đúng 1 menu (mở rộng nhiều menu/vị trí sau bằng cách bỏ ràng buộc)
  CHECK (scope='ADMIN' AND location='sidebar' OR scope='SITE' AND location IN ('header','footer','mobile'))

navigation.navigation_items            -- BẢNG CHUNG: cây cha-con nhiều cấp
  id          uuid PK
  menu_id     uuid NOT NULL FK -> navigation_menus ON DELETE RESTRICT
  parent_id   uuid NULL  FK -> navigation_items ON DELETE RESTRICT
  code        varchar(100) NOT NULL             -- ổn định cho seed/tham chiếu
  label       varchar(200) NOT NULL             -- (cột cũ: name)
  is_group    boolean NOT NULL DEFAULT false    -- nhóm/tiêu đề: không có link, chứa con
  url         varchar(500) NULL                 -- (cột cũ: route) route nội bộ hoặc URL ngoài
  icon        varchar(100) NULL
  sort_order  int NOT NULL DEFAULT 0
  is_active   boolean NOT NULL DEFAULT true     -- (FE mock gọi là isVisible)
  audit…, row_version
  UNIQUE (menu_id, code)
  INDEX (menu_id, parent_id, sort_order)
  CHECK ( is_group = false OR url IS NULL )     -- nhóm không có link
  -- parent phải cùng menu_id & is_group=true: validate ở service

navigation.navigation_item_site_details  -- BẢNG CHI TIẾT, chỉ item của menu SITE
  item_id        uuid PK FK -> navigation_items ON DELETE CASCADE
  target_type    varchar(20) NOT NULL           -- 'ROUTE' | 'PAGE' | 'EXTERNAL'
  target_id      uuid NULL                      -- Page id (Content), mềm — không FK chéo module
  open_in_new_tab boolean NOT NULL DEFAULT false

navigation.navigation_item_permissions   -- GIỮ cơ chế cũ, đổi tên/cột từ menu_permissions
  id uuid PK
  item_id         uuid NOT NULL FK -> navigation_items ON DELETE CASCADE
  permission_code varchar(150) NOT NULL         -- mềm, khớp claim JWT (chỉ code LÁ)
  UNIQUE (item_id, permission_code)
```

### 3.3 Quy tắc truy cập (đọc)

- **ADMIN** (`GET /navigation/me`, yêu cầu đăng nhập): giữ nguyên thuật toán hiện tại — item hiện nếu **không có dòng quyền** hoặc người gọi có ≥1 code; nhóm bị ẩn nếu không còn con hiển thị.
- **SITE** (`GET /navigation/public/{location}`, ẩn danh, cache 60 s phía FE):
  - Chỉ trả menu `scope='SITE'`, `is_active`, và **chỉ item KHÔNG có dòng quyền** → mặc định Public.
  - Nếu tương lai gán quyền cho item Site, item đó **tự biến mất khỏi endpoint ẩn danh** (an toàn mặc định); khi có "khách hàng có quyền" chỉ cần thêm endpoint có xác thực dùng lại đúng thuật toán lọc của ADMIN. Không đổi schema.
- Endpoint ADMIN **không bao giờ** trả menu `SITE` và ngược lại (lọc cứng theo `scope` ở truy vấn — chặn rò menu admin ra public).

### 3.4 Ghi (quản trị)

- Container: **`GET/POST/PUT/DELETE /navigation/containers`** (đặt tên khác `/navigation/menus` cũ để khỏi nhầm; xóa bị chặn khi còn item; `scope/location` bất biến).
- Item: **`/navigation/items`** (list theo `menuId`, CRUD, `PUT /items/{id}/permissions`, `PUT /containers/{id}/items/reorder`).
- Validate theo `scope` của container cha (không duplicate cột): item ADMIN → chỉ ROUTE, không `site_details`; item SITE → bắt buộc `site_details`, `target_type=PAGE` thì cần `target_id`.
- Gán quyền: **mở trong schema nhưng tắt bằng cấu hình** cho `SITE` (`Navigation:AllowSitePermissions=false` → 400 "chưa hỗ trợ"); bật khi có realm quyền cho khách.
- Quyền quản trị: giữ `menus.*` cho container/item `ADMIN` (không đổi code → role cũ không bị mất quyền); **thêm** `site-navigation.view|create|update|delete` cho `SITE` (tách để biên tập viên sửa menu website không sửa được sidebar admin). `menus.permissions.manage` dùng chung. Kiểm theo scope trong service.
- Tương thích: giữ `GET /navigation/menus` và `/menus*` cũ như **alias** đến khi FE chuyển xong, rồi xóa (bước dọn cuối).

### 3.5 Migration (giữ dữ liệu Render)

`Navigation_UnifyNavigation` (một migration, theo thứ tự):

1. Tạo `navigation_menus`; chèn `admin-sidebar` (ADMIN/sidebar), và seed 3 container SITE.
2. `menus` → `navigation_items`: `RENAME`, `name→label`, `route→url`; thêm `menu_id` (backfill = id `admin-sidebar`, rồi `NOT NULL`), `is_group` (backfill = `route IS NULL`), đổi unique `code` toàn cục → `(menu_id, code)`.
3. `menu_permissions` → `navigation_item_permissions` (`menu_id→item_id`), giữ nguyên dữ liệu.
4. Tạo `navigation_item_site_details`.
   Không mất dòng nào; `Down()` đảo ngược được. **Backup DB Render trước khi áp.**

### 3.6 Seed

- `NavigationSeeder` (idempotent): khai báo 4 container + cây ADMIN hiện có (đổi `route→url`, thêm `is_group` rõ ràng) + cây SITE lấy từ nội dung `navigation.mock.ts` (Header: Trang chủ `/`, Thực đơn **`/thuc-don`** — mock đang để `/menu`, vốn là redirect —, Tin tức `/tin-tuc`; Footer/Mobile theo mock).
- Mục sidebar "Navigation website" (`config.navigation`) gắn quyền `site-navigation.view`; thêm mục seed tương ứng.
- Chỉ đồng bộ cấu trúc cho dòng do seed sở hữu; không ghi đè `label/is_active` admin đã sửa.

### 3.7 FE — gom về MỘT feature `features/navigation`

- Một mô hình type `NavigationItem` + `NavigationScope`, một bộ Explorer/Editor/Tree dùng chung, tham số `scope` (`ADMIN` | `SITE`). Hai route giữ nguyên URL (`/admin/system/menus` = ADMIN, `/admin/settings/navigation` = SITE) nên menu seed không phải đổi.
- Editor hiển thị trường theo scope (SITE: loại đích, chọn Page, mở tab mới; ADMIN: ô gán quyền dùng `PermissionTree` của Phần 1, **thay** danh sách code phẳng `permissionCodeOptions`).
- `navigation.service.ts` gọi `adminApi` (admin) và `navigation-public.service.ts` (server, cache 60 s; fallback rỗng an toàn); `Header`/`Footer`/`MobileHeaderMenu` nhận cây từ server, bỏ refetch localStorage (`useLiveNavigation`).
- `features/admin-menus` **hợp nhất** vào `features/navigation`; `AdminSidebar` chuyển import; registry icon chuyển ra `src/lib` (đã được nhắc ở phiên trước).

---

## 4. Hard-code / mock sẽ xóa (chỉ liên quan 2 nghiệp vụ này)

| Xóa / thay                                                                                                            | Lý do                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/navigation/mocks/navigation.mock.ts`                                                                       | Chuyển thành seed BE                                                                                                                                          |
| `features/navigation/services/navigation.service.ts` (bản mock) + `api/navigation.api.ts` (nhánh `getApiMode`) | Gọi BE thật                                                                                                                                                   |
| `src/mocks/create-mock-store.ts`                                                                                     | Chỉ còn navigation dùng (đã grep) — xóa cùng lúc                                                                                                       |
| `NAVIGATION_LOCATION_OPTIONS/TARGET_TYPE_OPTIONS` hard-code                                                          | Lấy từ type dùng chung + container BE                                                                                                                        |
| `groupPermissionsByDomain` ở `useRoleEditor.ts`                                                                   | Thay bằng cây từ BE                                                                                                                                          |
| `permissionCodeOptions` phẳng trong editor menu                                                                     | Thay bằng `PermissionTree`                                                                                                                                   |
| `features/admin-menus` (thư mục)                                                                                   | Gộp vào `features/navigation`                                                                                                                               |
| `src/lib/http/api-mode.ts`                                                                                           | Xóa**nếu** sau khi gỡ không còn consumer (kiểm tra trước — đang có 1 consumer ngoài navigation? đã grep: chỉ navigation.api + chính file) |
| Cập nhật `CLAUDE.md` (bảng feature, mục "mock pattern", navigation) và `database_tayho.dbml`                  | Tài liệu khớp thực tế                                                                                                                                      |

Ngoài phạm vi, KHÔNG đụng: testimonials, favorites, `site.ts`, nội dung trang chủ, SEO, Sales… (nằm trong plan sau).

---

## 5. Thứ tự triển khai (khi được duyệt) — FE → BE → DB → Test

Mỗi bước 1 PR nhỏ, `tsc` + lint + build (FE) và `dotnet build/test` (BE) xanh mới sang bước sau.

**Bước A — Permission**

1. FE: type + `PermissionTree` + Explorer cây + Editor (đọc tạm cấu trúc phẳng khi BE chưa trả `parentId`, tránh vỡ khi deploy lệch).
2. BE: entity/config/validator/service (cycle, depth, quy tắc nhóm/lá), `GET /permissions/tree`, chuẩn hóa `SetPermissions`, thêm `is_group=false` vào query claim.
3. DB: migration `AddPermissionHierarchy` + seed nhóm/ánh xạ lá (idempotent).
4. Test: unit (cycle, depth, nhóm/lá), integration (CRUD, tree, gán role bằng id nhóm → lưu lá, claim không chứa nhóm, thêm lá mới không tự cấp), `AuthorizationDeniedTests` không đổi hành vi.

**Bước B — Navigation**

1. BE: entity `NavigationMenu`/`NavigationItem`/`NavigationItemSiteDetail`/`NavigationItemPermission`, services, endpoints (containers, items, `me`, `public/{location}`), quyền `site-navigation.*`, alias cũ.
2. DB: migration `UnifyNavigation` (đổi tên, backfill) + seed 4 container + cây SITE; chạy thử trên bản sao DB Render.
3. FE: hợp nhất `features/navigation`, nối Header/Footer/Mobile + AdminSidebar, xóa mock/hard-code mục 4, bỏ alias cũ.
4. Test: integration (CRUD theo scope, ADMIN không lộ sang public và ngược lại, item Site có dòng quyền bị ẩn khỏi public, `AllowSitePermissions=false` chặn), `NavigationMenuTests` hiện có cập nhật; smoke: sửa menu Site trong admin → Header/Footer đổi ≤60 s; sidebar đúng theo quyền sau migration.

**Bước C — Chốt**: `grep` không còn mock/hard-code mục 4; chạy `migrate` từ DB trống + `seed` hai lần (idempotent); kiểm thử phân quyền bằng role nhân viên.

---

## 6. Cần xác nhận trước khi code

1. **Quyền con thêm sau có tự cấp cho role đã chọn nhóm không?** Đề xuất: **không** (chọn nhóm = snapshot các lá hiện có). Nếu muốn "nhóm sống" (tự kế thừa), phải lưu nhóm trong `role_permissions` và đổi cách tính claim.
2. **Mã quyền cho Navigation Site**: tách `site-navigation.*` như đề xuất, hay dùng chung `menus.*`? --> làm như đề xuất tao thấy hợp lý
3. **`UNIQUE (scope, location)`**: mỗi vị trí đúng 1 menu (đúng mock hiện tại) — hay cần nhiều menu cùng vị trí (ví dụ 2 cột footer)?
4. **Độ sâu menu Site**: giới hạn bao nhiêu cấp (đề xuất 3 với Header/Footer, Mobile tùy FE hiển thị)? --> 3 cấp
5. **Nhóm quyền mặc định 2 cấp (Module → Tài nguyên)** theo sidebar — đồng ý, hay muốn cấu trúc khác? --> 3 => 1 module tưng ứng với nghiệp vụ gì --> sử dụng tài nguyên nhóm nghiệp vụ nào --> chi tiết lá có thể bỏ chọn or click thì đc quyền làm
6. **Backup & cửa sổ migrate trên Render**: đồng ý backup trước khi áp migration Navigation (đổi tên bảng). --> ko cần backup mày chỉ cần soạn dữ liệu theo nghiệp vụ liên quan ghi vào docs nào đó để khi hoàn thành design --. thì dựa vào nó để chạy migtaion seed lại toàn bộ data mẫu đễ test tránh bị lỗi
