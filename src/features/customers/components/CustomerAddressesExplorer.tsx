"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";

import { useCustomerAddressesExplorer } from "../hooks/useCustomerAddressesExplorer";
import type { ManagedCustomerAddress } from "../types/customer-address.types";

function formatAddress(address: ManagedCustomerAddress): string {
  return [address.addressLine, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(", ");
}

type CustomerAddressesExplorerProps = {
  customerId: string;
};

export function CustomerAddressesExplorer({ customerId }: CustomerAddressesExplorerProps) {
  const { rows, customerName, isLoading, handleDelete, handleSetDefault } =
    useCustomerAddressesExplorer({ customerId });

  const columns: DataExplorerColumn<ManagedCustomerAddress>[] = [
    { key: "receiverName", header: "Người nhận" },
    { key: "phone", header: "Số điện thoại" },
    {
      key: "addressLine",
      header: "Địa chỉ",
      render: (row) => formatAddress(row),
    },
    {
      key: "isDefault",
      header: "Mặc định",
      render: (row) =>
        row.isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-1 text-[12px] font-bold text-brand-greenDark">
            <Star className="size-3" fill="currentColor" strokeWidth={0} />
            Mặc định
          </span>
        ) : (
          <button
            type="button"
            onClick={() => handleSetDefault(row)}
            className="text-[12px] font-bold text-brand-muted transition hover:text-brand-greenDark hover:underline"
          >
            Đặt làm mặc định
          </button>
        ),
    },
  ];

  return (
    <div>
      <Link
        href={`/admin/sales/customers/${customerId}`}
        className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
      >
        ← Quay lại {customerName ? `"${customerName}"` : "danh sách khách hàng"}
      </Link>

      <div className="mt-3">
        <DataExplorer<ManagedCustomerAddress>
          title={customerName ? `Địa chỉ của "${customerName}"` : "Địa chỉ khách hàng"}
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          getSearchableText={(row) => `${row.receiverName} ${row.phone} ${formatAddress(row)}`}
          searchPlaceholder="Tìm địa chỉ..."
          createHref={`/admin/sales/customers/${customerId}/addresses/new`}
          createLabel="Thêm địa chỉ"
          editHref={(row) => `/admin/sales/customers/${customerId}/addresses/${row.id}`}
          onDelete={handleDelete}
          emptyState="Khách hàng này chưa có địa chỉ nào."
        />
      </div>
    </div>
  );
}
