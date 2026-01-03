import type { ReactNode } from "react";

interface PrivateRoutesLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function PrivateRoutesLayout({
  children,
  modal,
}: PrivateRoutesLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
