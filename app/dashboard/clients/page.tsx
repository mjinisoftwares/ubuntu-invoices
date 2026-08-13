import { getClients } from "@/utils/clients";
import ClientsClient from "./clients-client";

export const metadata = {
  title: "Clients | Ubuntu Logistics",
  description: "Manage client directory, view billing history, and link clients to invoices and quotations.",
};

export default async function ClientsPage() {
  const clients = await getClients();

  return <ClientsClient initialClients={clients} />;
}
