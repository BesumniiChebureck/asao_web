"use client";

import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
    </div>
  );
}
