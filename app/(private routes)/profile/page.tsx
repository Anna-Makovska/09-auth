import type { Metadata } from "next";
import ProfileClient from "./Profile.client";
import css from "./page.module.css";

export const metadata: Metadata = {
  title: "Profile",
  description: "User profile page",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
