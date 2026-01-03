"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMe } from "@/lib/api/clientApi";
import useAuthStore from "@/lib/store/authStore";
import css from "./page.module.css";
import type User from "@/types/user";

export default function ProfilePage() {
  const { user: storeUser, setUser } = useAuthStore();
  const [user, setLocalUser] = useState<User | null>(storeUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setLocalUser(userData);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!storeUser) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [storeUser, setUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>
        <div className={css.avatarWrapper}>
          <Image
            src={user?.avatar || "/default-avatar.png"}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>
        <div className={css.profileInfo}>
          <p>Username: {user?.username || "Not set"}</p>
          <p>Email: {user?.email}</p>
        </div>
      </div>
    </main>
  );
}
