import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ClipboardList } from "lucide-react";

interface props {
  status: string;
  tanggalMulai: string;
  namaInstansi: string;
  setIdLog: () => void;
}

export default function RiwayatCard({
  status,
  tanggalMulai,
  namaInstansi,
  setIdLog,
}: props) {
  return (
    <div className="border-[1px] dark:bg-black border-green-600 bg-green-100 rounded-lg p-3 mb-2">
      <div className="flex justify-between">
        <div className="flex justify-start gap-8">
          <p className="text-xs font-bold">
            <ClipboardList /> Status KP : {status}
          </p>
          <p className="text-xs font-bold">
            <ClipboardList /> {namaInstansi}
          </p>
          <p className="text-xs font-bold">
            <ClipboardList /> {tanggalMulai}
          </p>
        </div>
        <p className="text-xs">Progress Terkini : Pendaftaran KP</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <h2 className="font-bold text-lg">Kerja Praktek #1</h2>
        <Button
          onClick={setIdLog}
          className="flex flex-between text-white py-2 px-4 rounded-lg bg-green-600"
        >
          Lihat Log {"  >"}
        </Button>
      </div>
    </div>
  );
}
