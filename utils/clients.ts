"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ClientData {
  id?: string;
  name: string;
  email: string;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    invoices: number;
    quotations: number;
  };
  totalBilled?: number;
}

export async function getClients(): Promise<ClientData[]> {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            invoices: true,
            quotations: true,
          },
        },
        invoices: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    return clients.map((c) => {
      const totalBilled = c.invoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount || 0),
        0
      );

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        mobile: c.mobile,
        address: c.address,
        city: c.city,
        state: c.state,
        pincode: c.pincode,
        country: c.country,
        notes: c.notes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        _count: c._count,
        totalBilled,
      };
    });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}

export async function getClientById(id: string): Promise<ClientData | null> {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            invoices: true,
            quotations: true,
          },
        },
      },
    });

    if (!client) return null;

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      mobile: client.mobile,
      address: client.address,
      city: client.city,
      state: client.state,
      pincode: client.pincode,
      country: client.country,
      notes: client.notes,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      _count: client._count,
    };
  } catch (error) {
    console.error("Failed to fetch client by id:", error);
    return null;
  }
}

export async function saveClient(client: {
  id?: string;
  name: string;
  email: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  notes?: string;
}) {
  try {
    let result;

    if (client.id) {
      result = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: client.name,
          email: client.email,
          mobile: client.mobile || null,
          address: client.address || null,
          city: client.city || null,
          state: client.state || null,
          pincode: client.pincode || null,
          country: client.country || null,
          notes: client.notes || null,
        },
      });
    } else {
      result = await prisma.client.upsert({
        where: { email: client.email },
        update: {
          name: client.name,
          mobile: client.mobile || null,
          address: client.address || null,
          city: client.city || null,
          state: client.state || null,
          pincode: client.pincode || null,
          country: client.country || null,
          notes: client.notes || null,
        },
        create: {
          name: client.name,
          email: client.email,
          mobile: client.mobile || null,
          address: client.address || null,
          city: client.city || null,
          state: client.state || null,
          pincode: client.pincode || null,
          country: client.country || null,
          notes: client.notes || null,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/quotations");
    return result;
  } catch (error) {
    console.error("Failed to save client:", error);
    throw error;
  }
}

export async function deleteClientRecord(id: string) {
  try {
    // Check if client has linked invoices or quotations
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            invoices: true,
            quotations: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    if (client._count.invoices > 0 || client._count.quotations > 0) {
      throw new Error(
        `Cannot delete client with existing invoices (${client._count.invoices}) or quotations (${client._count.quotations}). Please delete related documents first.`
      );
    }

    const deleted = await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/clients");
    return deleted;
  } catch (error) {
    console.error("Failed to delete client:", error);
    throw error;
  }
}
