// Import redirect của Next để hỗ trợ đường dẫn /menu nếu user quen dùng tiếng Anh.
import { redirect } from "next/navigation";

// Page alias: tự chuyển /menu sang /thuc-don.
export default function MenuAliasPage() {
  // Redirect server-side, không render UI thừa.
  redirect("/thuc-don");
}
