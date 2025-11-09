"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import useSWR from "swr";

interface ModelUsers {
  id: number;
  name: string;
  notelp: number;
  role: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePageUser() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:3001/api/users",
    fetcher
  );

  if (error) console.log ("SWR ERROR", error);

  return (
    <div className="min-h-screen bg-gray-300/70">
      <header className="bg-white py-10 shadow-xl">
        <div className="flex items-center justify-between mx-30">
          <div className="text-3xl font-bold tracking-tight">
            Rental PS Arhas
          </div>
          <div className="flex space-x-10 mr-5">
            <Button className="h-10 shadow-md bg-black text-white rounded-lg">
              Lapor
            </Button>
            <Button className="h-10 shadow-md bg-black text-white rounded-lg">
              Ditemukan
            </Button>
          </div>
        </div>
      </header>

      <article>
        <div className="flex justify-center py-5 mt-5">
          <p className="font-bold text-2xl">
            Website Penemuan dan Pelaporan Barang Hilang
          </p>
        </div>

        {isLoading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-600">Error loading data</p>}

        {data?.users?.map((item: ModelUsers) => (
            <div key={item.id} className="flex flex-col items-center py-5 mt-5">
              <p className="font-bold text-xl">Nama: {item.name}</p>
              <p className="font-bold text-xl">No: {item.notelp}</p>
              <p className="font-bold text-xl">Role: {item.role}</p>
            </div>
          ))}
      </article>
    </div>
  );
}
