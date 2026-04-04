import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function Layout({ children }) {

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );

}