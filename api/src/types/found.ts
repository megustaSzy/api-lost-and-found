export interface FoundData {
  namaBarang: string;
  deskripsi: string;
  lokasiTemu: string;
  tanggal?: string; 
  imageUrl?: string;
  imagePublicId?: string;
}

export interface FoundUpdateData extends FoundData {
  lostReportId?: number | null;
}

export type FoundStatusType = "PENDING" | "CLAIMED" | "REJECTED";
