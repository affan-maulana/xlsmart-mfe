import { redirect } from "next/navigation";

/**
 * Subscription Management landing page.
 * Routes to the active workflow module — currently only pre-to-post.
 * New modules (post-to-pre, termination, change-ownership) will get their
 * own routes here as they are built.
 *
 * NOTE: Next.js redirect() automatically prepends basePath. Do not use
 * withBasePath() here — it would double the path.
 */
export default function SubscriptionManagementPage() {
  redirect("/pre-to-post");
}
