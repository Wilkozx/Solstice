"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addCustomer } from "@/lib/db";

import { Customer } from "@/types";

export default function AddCustomer() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedLastname = lastname.trim();

    if (!trimmedName) {
      setError("First name is required");
      return;
    }

    if (!trimmedLastname) {
      setError("Last name is required");
      return;
    }

    try {
      const createdCustomer: Customer = await addCustomer(trimmedName, trimmedLastname);

      // Redirect to their curated edit page
      navigate(`/customer/${createdCustomer.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create customer");
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-md">
      {/* Back Button */}
      <Button variant="outline" className="mb-6" onClick={() => navigate("/")}>
        &larr; Back to Customers
      </Button>

      <h1 className="text-xl font-bold mb-4">Add Customer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">First Name</Label>
          <Input
            id="name"
            placeholder="Customer First Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="lastname">Last Name</Label>
          <Input
            id="lastname"
            placeholder="Customer Last Name"
            value={lastname}
            onChange={e => setLastname(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <Button type="submit">Create Customer</Button>
      </form>
    </div>
  );
}
