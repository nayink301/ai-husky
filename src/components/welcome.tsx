// src/components/welcome.tsx
import { useEffect, useState } from "react";
import { getDisplayName } from "@/lib/user";
import { isDemoMode } from "@/lib/demoFlag";

export default function Welcome({ className = "" }: { className?: string }) {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    getDisplayName().then(setName).catch(() => setName("friend"));
  }, []);

  if (isDemoMode()) {
    return (
      <p className={`text-sm text-gray-600 ${className}`}>
        👋 Hello, <span className="font-medium">stranger</span> — this is a demo. Your actions affect only this browser.
      </p>
    );
  }

  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      👋 Hey <span className="font-medium">{name}</span> — welcome back!
    </p>
  );
}
