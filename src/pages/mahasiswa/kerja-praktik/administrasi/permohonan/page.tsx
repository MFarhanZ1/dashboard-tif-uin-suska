import { Link } from "react-router";
import ProgressBar from "@/components/mahasiswa/daftar-kp/ProgressBar";
import { useEffect, useState } from "react";
import RiwayatCard from "@/components/mahasiswa/daftar-kp/RiwayatCard";
import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import APIDaftarKP from "@/services/api/mahasiswa/daftar-kp.service";
import { api } from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";

interface KPInterface {
  id: string;
  status: string;
  tanggal_mulai: string;
  level_akses: number;
  instansi: {
    nama: string;
  };
}

export default function MahasiswaKerjaPraktekDaftarKpPermohonanPage() {
  const [idLog, setIdLog] = useState<string | null>(null);
  const [log, setLog] = useState<any[]>([]);

  // KPInterface = aktif
  // null = data gagal didapatkan
  // undefined = sudah lulus
  // false = tidak sedang mendaftar dan belum lulus

  const { data: riwayatKP, isLoading } = useQuery({
    queryKey: ["riwayat-kp-mahasiswa"],
    queryFn: () =>
      APIDaftarKP.getRiwayatKP()
        .then((res) => res.data)
        .catch((error) => console.log(error)),
  });

  const { data: tanggalKP } = useQuery({
    queryKey: ["tanggal-kp-mahasiswa"],
    queryFn: () =>
      APIDaftarKP.getTanggalDaftarKP()
        .then((res) => res.data)
        .catch((error) =>
          console.log(`Gagal mendapatkan tanggal KP, Error = ${error}`)
        ),
  });

  const { data: activeKP } = useQuery({
    queryKey: ["kp-terbaru-mahasiswa"],
    queryFn: () =>
      APIDaftarKP.getKPAktifMahasiswa()
        .then((res) => res.data)
        .catch((error) =>
          console.log(`Gagal mendapatkan tanggal KP, Error = ${error}`)
        ),
  });

  let isTanggalPendaftaranOpen = false;
  if (tanggalKP?.tanggal_akhir_pendaftaran_kp) {
    isTanggalPendaftaranOpen =
      new Date(tanggalKP?.tanggal_akhir_pendaftaran_kp).getTime() >
      new Date().getTime();
  }

  useEffect(() => {
    (async function () {
      if (idLog) {
        const axios = api();
        axios
          .get(
            `${
              import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
            }/mahasiswa/daftar-kp/log/${idLog}`
          )
          .then((res) => {
            setLog(res.data.data);
          })
          .catch((error) => console.log(error));
      }
    })();
  }, [idLog]);

  let StepComponent = <div></div>;

  if (!activeKP) {
    StepComponent = (
      <Card className="rounded-md border-green-500 border-2 bg-green-100">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">
            Permohonan Pendaftaran Kerja Praktek
          </CardTitle>
          <CardDescription className="text-stone-500 my-2">
            Silakan Lakukan Pendaftaran Kerja Praktek Pada Tombol di Bawah ini
            Jika Sudah Memenuhi Syarat:
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2">
          <CardDescription className="rounded-md bg-white py-3 px-2">
            <CardDescription>{"tif kerja-praktek@latest"}</CardDescription>
            <CardDescription className="text-cyan-700">
              ✔ Setoran Hafalan 1-8
            </CardDescription>
            <CardDescription className="text-cyan-700">
              ✔ 80 SKS yang telah Diambil
            </CardDescription>
            <CardDescription className="text-cyan-700">
              ✔ Matakuliah Rekayasa Perangkat Lunak Berorientasi Objek Min. D
            </CardDescription>
            <CardDescription className="text-cyan-700">
              ✔ Matakuliah Sistem Informasi Min. D
            </CardDescription>
            <CardDescription className="text-cyan-700">
              ✔ Matakuliah Jaringan Komputer Min. D
            </CardDescription>
            <CardDescription className="text-cyan-700">
              ✔ Menyiapkan Sistem
            </CardDescription>
            <CardDescription className="text-blue-800">
              ℹ Updated 1 file:
            </CardDescription>
            <CardDescription className="text-blue-800">
              - lib/kerja-praktek.ts
            </CardDescription>
            <CardDescription className="text-green-400">
              Success! Sistem siap digunakan.
            </CardDescription>
            <CardDescription>
              Silakan mulai pendaftaran kerja praktek Anda.
            </CardDescription>
          </CardDescription>
        </CardContent>
        <CardFooter>
          <Link
            to={{
              pathname:
                "/mahasiswa/kerja-praktik/daftar-kp/permohonan/form-pendaftaran",
            }}
            className="block text-center w-full hover:cursor-pointer hover:bg-green-400 bg-green-500 py-[4px] rounded-md text-white text-sm font-bold mt-2"
          >
            Buat Permohonan ➡
          </Link>
        </CardFooter>
      </Card>
    );
  }
  if (activeKP) {
    console.log(activeKP);
    StepComponent = (
      <Card className="rounded-md border-green-500 border-2 py-2 px-4 bg-green-100 dark:bg-black">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">
            Permohonan Pendaftaran Kerja Praktek
          </CardTitle>
          <CardDescription className="text-stone-500 my-2">
            Silakan Lakukan Pendaftaran Kerja Praktek Pada Tombol di Bawah ini
            Jika Sudah Memenuhi Syarat:
          </CardDescription>
        </CardHeader>
        <CardContent className="rounded-lg pt-4 flex justify-center gap-12 items-center">
          <div>
            <CardDescription className="text-lg font-bold">
              Progress Terkini Pendaftaran Kerja Praktek :
            </CardDescription>
            <ProgressBar currentStep={activeKP.level_akses} />
          </div>
          <Card className="shadow-xl py-3 pl-3 pr-20 rounded-lg">
            <CardHeader>
              <CardTitle className="font-bold">
                PENGAJUAN INSTANSI KP :
              </CardTitle>
              <CardDescription>
                {(activeKP as KPInterface).instansi?.nama || ""}
              </CardDescription>
            </CardHeader>
          </Card>
        </CardContent>
        <CardFooter className="md:mx-auto md:w-[500px] flex items-center justify-between rounded-full border-[1px] border-black dark:border-white p-2 mt-3">
          <CardDescription className="text-sm">
            Silakan lanjut untuk validasi kelengkapan berkas!
          </CardDescription>
          <Link
            to={{
              pathname: "/mahasiswa/kerja-praktik/daftar-kp/kelengkapan-berkas",
            }}
            className="rounded-full p-2 bg-green-600 text-white text-sm font-semibold"
          >
            LANJUT {">"}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <DashboardLayout>
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      )}
      {!isLoading && isTanggalPendaftaranOpen && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-xl">
                Pendaftaran Kerja Praktek
              </CardTitle>
              <CardDescription>
                Berikut detail Progres Pendaftaran Kerja Praktek Anda, semangat
                terus ya...
              </CardDescription>
            </CardHeader>
          </Card>
          {StepComponent}
          <Card>
            <CardContent className="rounded-lg p-2 mt-3 shadow-lg">
              <CardTitle className="font-semibold tracking-wide">
                Detail Riwayat
              </CardTitle>
              <h4 className="mt-2 font-medium text-[14px] mb-2">Aktif</h4>
              {(!riwayatKP || riwayatKP.length === 0) && (
                <Card className="p-2 text-center">
                  Tidak ada data riwayat KP yang tersedia saat ini.
                </Card>
              )}
              {riwayatKP &&
                riwayatKP.length > 0 &&
                riwayatKP.map(
                  ({ id, status, tanggal_mulai, instansi: { nama } }, i) => (
                    <RiwayatCard
                      setIdLog={() => setIdLog(id)}
                      key={i}
                      status={status}
                      tanggalMulai={tanggal_mulai
                        .slice(0, 10)
                        .replaceAll("-", "/")}
                      namaInstansi={nama || ""}
                    />
                  )
                )}
              {idLog && (
                <LogComponent data={log} setIdLog={() => setIdLog("")} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}

interface LogInterface {
  setIdLog: () => void;
  data: {
    message: string;
    tanggal: string;
    status: number;
  }[];
}

function LogComponent({ data, setIdLog }: LogInterface) {
  const [currentTab, setCurrentTab] = useState("All New");
  return (
    <Card className="flex flex-col gap-4 absolute left-[50%] -translate-x-1/2 top-[50%] -translate-y-1/2 w-[50%] p-2 bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-center text-lg font-bold tracking-wide">
          Logs Kerja Praktek #1
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-[75%] m-auto flex rounded-lg bg-gray-300">
          {/* <Button
            onClick={() => setCurrentTab("All New")}
            className={`flex-grow text-black ${
              currentTab === "All New" ? "bg-green-400" : "bg-gray-300"
            } rounded-lg p-2`}
          >
            All New
          </Button> */}
          <Button
            onClick={() => setCurrentTab("Pendaftaran Kp")}
            className={`flex-grow text-black ${
              currentTab === "Pendaftaran Kp" ? "bg-green-400" : "bg-gray-300"
            } rounded-lg p-2`}
          >
            Pendaftaran Kp
          </Button>
          {/* <Button
            onClick={() => setCurrentTab("Daily Report")}
            className={`flex-grow text-black ${
              currentTab === "Daily Report" ? "bg-green-400" : "bg-gray-300"
            } rounded-lg p-2`}
          >
            Daily Report
          </Button>
          <Button
            onClick={() => setCurrentTab("Sem-Kp")}
            className={`flex-grow text-black ${
              currentTab === "Sem-Kp" ? "bg-green-400" : "bg-gray-300"
            } rounded-lg p-2`}
          >
            Sem-Kp
          </Button> */}
        </div>
      </CardContent>
      {!data && (
        <Card className="text-center">
          Tidak ada log yang dapat ditampilkan
        </Card>
      )}
      {data &&
        data.map((item, i) => (
          <LogCard
            key={i}
            info={item.message}
            date={item.tanggal}
            status={item.status}
          />
        ))}

      <Button onClick={setIdLog}>Tutup</Button>
    </Card>
  );
}

interface LogCardInterface {
  info: string;
  date: string;
  status: number;
}

function LogCard({ info, date, status }: LogCardInterface) {
  let style = "bg-gray-400";
  if (status === 1) {
    style = "bg-green-400";
  } else if (status === 2) {
    style = "bg-red-400";
  }
  return (
    <Card className={`flex flex-col gap-2 rounded-lg p-2 ${style}`}>
      <p>{info}</p>
      <p>{date.slice(0, 10)}</p>
    </Card>
  );
}
