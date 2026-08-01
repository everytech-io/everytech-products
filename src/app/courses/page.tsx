import { redirect } from "next/navigation";

/**
 * `/courses` is a namespace, not a page — there is exactly one course so far.
 * Redirect rather than 404 so a shortened or hand-typed link still lands
 * somewhere useful. When a second course ships, this becomes a real index.
 */
export default function CoursesPage() {
  redirect("/courses/claude");
}
