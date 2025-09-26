"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types";

import { Clock, MoreHorizontal, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { removeCustomer } from "@/lib/db";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Firstname",
  },
  {
    accessorKey: "lastname",
    header: "Lastname",
  },
  {
    accessorKey: "minutes_remaining",
    header: "Minutes Remaining",
    cell: ({ row }) => {
      const minutes = row.getValue("minutes_remaining") as number;
      return <span>{minutes} min</span>;
    },
  },
  {
    accessorKey: "plan_type",
    header: "hasActivePlan",
    cell: ({ row }) => (row.original.plan_type ? "true" : ""),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;
      const navigate = useNavigate();

      const RefButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
        (props, ref) => (
          <button ref={ref} {...props} className={`h-8 w-8 p-0 ${props.className ?? ""}`} />
        )
      );
      RefButton.displayName = "RefButton";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <RefButton onClick={e => e.stopPropagation()}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </RefButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                navigator.clipboard.writeText(customer.id.toString());
              }}
            >
              Copy Customer ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                navigate(`/customer/${customer.id}/history`);
              }}
            >
              <Clock className="mr-2 h-4 w-4" /> View History
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={async e => {
                e.stopPropagation();

                const fullName = customer.lastname
                  ? `${customer.name} ${customer.lastname}`
                  : customer.name;

                if (
                  !window.confirm(
                    `Are you sure you want to delete ${fullName}? This will remove all their transactions.`
                  )
                )
                  return;

                try {
                  await removeCustomer(customer.id);
                  alert("Customer deleted!");
                  window.location.reload();
                } catch (err) {
                  console.error(err);
                  alert("Failed to delete customer");
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
