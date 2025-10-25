import Layout from "@/components/Layout";
import './globals.css';

export default function Home() {
  return (
    <Layout>
      <div className="p-6 bg-white rounded-xl shadow text-gray-800">
        <h1 className="text-2xl font-bold text-[#C62828] mb-3">
          Welcome to PropMan
        </h1>
        <p>Manage your properties, tenants, and maintenance requests efficiently.</p>
      </div>
    </Layout>
  );
}

