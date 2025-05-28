"use client";

import { Link } from "react-router";
import CardProgressKelengkapanBerkas from "@/components/mahasiswa/daftar-kp/CardProgressKelengkapanBerkas";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import { IsPendaftaranKPLanjutClosed } from "@/helpers/batas-waktu-pendaftaran..validator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios-instance";
import APIDaftarKP from "@/services/api/mahasiswa/daftar-kp.service";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

const DataCardProgressKelengkapanBerkas = [
  "Surat Pengantar",
  "Surat Balasan Instansi",
  "Id Pengajuan Dosen Pembimbing",
  "Surat Penunjukkan Dosen Pembimbing",
  "Selesai",
];

interface KPInterface {
  status: string;
  tanggal_mulai: string;
  level_akses: number;
  link_surat_pengantar?: string | null;
  link_surat_balasan?: string | null;
  link_surat_penunjukan_dospem?: string | null;
  link_surat_perpanjangan_kp?: string | null;
  id_surat_pengajuan_dospem?: string | null;
  catatan_penolakan?: string | null;
}

interface CommonResponse {
  response: boolean;
  message: string;
}

interface StatusValidasiInterface {
  style: string;
  message: string;
}

export default function MahasiswaKerjaPraktekDaftarKPKelengkapanBerkasPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<CommonResponse | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [tanggalPendaftaran, setTanggalPendaftaran] = useState();
  const [isLanjutKPClicked, setIsLanjutKPClicked] = useState<boolean>(false);
  const [isPendaftaranKPLanjutClosed, setIsPendaftaranKPLanjutClosed] =
    useState<boolean | null | undefined>();
  const [dataKPTerbaru, setDataKPTerbaru] = useState<KPInterface>({
    status: "",
    tanggal_mulai: "",
    level_akses: 0,
    link_surat_pengantar: "",
    link_surat_balasan: "",
    link_surat_penunjukan_dospem: "",
    link_surat_perpanjangan_kp: "",
    id_surat_pengajuan_dospem: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  let url = `${
    import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
  }/mahasiswa/daftar-kp/unggah-surat-pengantar-kp`;
  let InputField = <div></div>;
  let statusValidasi: StatusValidasiInterface = {
    style: "",
    message: "",
  };

  useQuery({
    queryKey: ["kp-terbaru-kelengkapan-berkas"],
    queryFn: () =>
      APIDaftarKP.getKPAktifMahasiswa().then((res) => {
        setDataKPTerbaru(res.data);
        if (res.data?.level_akses % 2 === 0) {
          setCurrentPage(res.data.level_akses - 1);
        } else {
          setCurrentPage(res.data.level_akses);
        }
        return res.data;
      }),
  });

  useQuery({
    queryKey: ["tanggal-daftar-kelengkapan-berkas"],
    queryFn: () =>
      APIDaftarKP.getTanggalDaftarKP().then((res) => {
        setDataKPTerbaru(res.data);
        setTanggalPendaftaran(res.data);

        IsPendaftaranKPLanjutClosed().then((res) => {
          console.log(res);
          setIsPendaftaranKPLanjutClosed(res);
        });

        return res.data;
      }),
  });

  // useEffect(() => {
  //   (async function () {
  //     const response1 = await fetch(
  //       `${
  //         import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
  //       }/mahasiswa/daftar-kp/get-tanggal-daftar-kp`
  //     );
  //     if (!response1.ok) {
  //       throw new Error("Gagal mendapatkan data tanggal");
  //     }
  //     const data1 = await response1.json();
  //     setTanggalPendaftaran(data1.data);

  //     setIsPendaftaranKPLanjutClosed(await IsPendaftaranKPLanjutClosed());
  //   })();
  // }, []);

  if (currentPage === 1 && dataKPTerbaru?.level_akses! >= 1) {
    if (dataKPTerbaru?.level_akses === 1) {
      if (dataKPTerbaru.catatan_penolakan) {
        statusValidasi.style = "bg-red-600";
        statusValidasi.message = dataKPTerbaru.catatan_penolakan;
      } else {
        statusValidasi.style = "bg-gray-600";
        statusValidasi.message = "Belum mengirimkan berkas";
      }
    } else if (dataKPTerbaru?.level_akses === 2) {
      statusValidasi.style = "bg-blue-400";
      statusValidasi.message = "menunggu divalidasi oleh Koordinator KP";
    } else {
      statusValidasi.style = "bg-green-600";
      statusValidasi.message =
        "Berkas KP berhasil divalidasi oleh Koordinator KP";
    }
    InputField = (
      <Card className="border-[1px] border-slate-300 ">
        <div className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-bold text-lg">
              Dokumen Surat Pengantar dari Dekan
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Silakan inputkan Link Gdrive dengan file harus berformat pdf.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label
              className="font-bold text-sm mt-1"
              htmlFor="surat-pengantar-kp"
            >
              Link :{" "}
            </Label>
            <Input
              required
              key="surat-pengantar"
              onChange={(e) => setInputValue(e.target.value)}
              value={
                dataKPTerbaru?.level_akses > 2
                  ? dataKPTerbaru.link_surat_pengantar || ""
                  : inputValue
              }
              readOnly={dataKPTerbaru?.level_akses > 2}
              className={`mt-1 text-black p-2 border-[1px] border-slate-300   ${
                dataKPTerbaru?.level_akses > 2 ? "hover:cursor-not-allowed" : ""
              }`}
              type="text"
              placeholder="Masukkan Link Berkas..."
              id="surat-pengantar-kp"
              name="linkSuratPengantarKP"
            />
          </CardContent>
        </div>
      </Card>
    );
  } else if (currentPage === 3 && dataKPTerbaru?.level_akses! >= 3) {
    if (dataKPTerbaru?.level_akses === 3) {
      if (dataKPTerbaru.catatan_penolakan) {
        statusValidasi.style = "bg-red-600";
        statusValidasi.message = dataKPTerbaru.catatan_penolakan;
      } else {
        statusValidasi.style = "bg-gray-600";
        statusValidasi.message = "Belum mengirimkan berkas";
      }
    } else if (dataKPTerbaru?.level_akses === 4) {
      statusValidasi.style = "bg-blue-400";
      statusValidasi.message = "menunggu divalidasi oleh Koordinator KP";
    } else {
      statusValidasi.style = "bg-green-600";
      statusValidasi.message =
        "Berkas KP berhasil divalidasi oleh Koordinator KP";
    }
    url = `${
      import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
    }/mahasiswa/daftar-kp/unggah-surat-balasan-kp`;
    InputField = (
      <Card className="border-[1px] border-slate-300 p-3 ">
        <div className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-bold text-lg">
              Dokumen Surat Jawaban dari Instansi
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Silakan inputkan Link Gdrive dengan file harus berformat pdf.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label
              className="font-bold text-sm mt-1"
              htmlFor="surat-balasan-kp"
            >
              Link :{" "}
            </Label>
            <Input
              required
              key="surat-balasan"
              onChange={(e) => setInputValue(e.target.value)}
              value={
                dataKPTerbaru?.level_akses > 4
                  ? dataKPTerbaru.link_surat_balasan || ""
                  : inputValue
              }
              readOnly={dataKPTerbaru?.level_akses > 4}
              className={`mt-1 text-black p-2 border-[1px] border-slate-300  ${
                dataKPTerbaru?.level_akses > 4 ? "hover:cursor-not-allowed" : ""
              }`}
              type="text"
              placeholder="Masukkan Link Berkas..."
              id="surat-balasan-kp"
              name="linkSuratBalasanKP"
            />
          </CardContent>
        </div>
      </Card>
    );
  } else if (currentPage === 5 && dataKPTerbaru?.level_akses! >= 5) {
    if (dataKPTerbaru?.level_akses === 5) {
      if (dataKPTerbaru.catatan_penolakan) {
        statusValidasi.style = "bg-red-600";
        statusValidasi.message = dataKPTerbaru.catatan_penolakan;
      } else {
        statusValidasi.style = "bg-gray-600";
        statusValidasi.message = "Belum mengirimkan berkas";
      }
    } else if (dataKPTerbaru?.level_akses === 6) {
      statusValidasi.style = "bg-blue-400";
      statusValidasi.message = "menunggu divalidasi oleh Koordinator KP";
    } else {
      statusValidasi.style = "bg-green-600";
      statusValidasi.message =
        "Berkas KP berhasil divalidasi oleh Koordinator KP";
    }
    url = `${
      import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
    }/mahasiswa/daftar-kp/unggah-id-pengajuan-dosen-pembimbing-kp`;
    InputField = (
      <Card className="grid md:grid-cols-2 gap-4">
        <Card className="border-[1px] border-slate-300 p-3 ">
          <CardHeader>
            <CardTitle className="font-bold text-lg">
              Link Pengajuan Dosen Pembimbing pada Portal FST
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Silakan kunjungi link di bawah ini :
            </CardDescription>
          </CardHeader>
          <CardDescription>
            http://seminar-fst.uin-suska.ac.id/akademik/prosedur/pembimbing
          </CardDescription>
        </Card>
        <Card className="border-[1px] border-slate-300 p-3 ">
          <CardHeader>
            <CardTitle className="font-bold text-lg">
              Id Pengajuan Portal FST
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Silakan masukkan Id pengajuan yang telah diperoleh dari portal FST
              :
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label
              className="font-bold text-sm mt-1"
              htmlFor="id-pengajuan-dosen-pembimbing"
            >
              Id Pengajuan Pembimbing KP :{" "}
            </Label>
            <Input
              required
              key="id-pengajuan-dospem"
              onChange={(e) => setInputValue(e.target.value)}
              value={
                dataKPTerbaru?.level_akses > 6
                  ? dataKPTerbaru.id_surat_pengajuan_dospem || ""
                  : inputValue
              }
              readOnly={dataKPTerbaru?.level_akses > 6}
              className={`mt-1 text-black p-2 border-[1px] border-slate-300  ${
                dataKPTerbaru?.level_akses > 6 ? "hover:cursor-not-allowed" : ""
              }`}
              type="text"
              placeholder="Masukkan Id Pengajuan..."
              id="id-pengajuan-dosen-pembimbing"
              name="IdPengajuanDosenPembimbingKP"
            />
          </CardContent>
        </Card>
      </Card>
    );
  } else if (currentPage === 7 && dataKPTerbaru?.level_akses! >= 7) {
    if (dataKPTerbaru?.level_akses === 7) {
      if (dataKPTerbaru.catatan_penolakan) {
        statusValidasi.style = "bg-red-600";
        statusValidasi.message = dataKPTerbaru.catatan_penolakan;
      } else {
        statusValidasi.style = "bg-gray-600";
        statusValidasi.message = "Belum mengirimkan berkas";
      }
    } else if (dataKPTerbaru?.level_akses === 8) {
      statusValidasi.style = "bg-blue-400";
      statusValidasi.message = "menunggu divalidasi oleh Koordinator KP";
    } else {
      statusValidasi.style = "bg-green-600";
      statusValidasi.message =
        "Berkas KP berhasil divalidasi oleh Koordinator KP";
    }
    url = `${
      import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
    }/mahasiswa/daftar-kp/unggah-surat-penunjukkan-dosen-pembimbing-kp`;
    InputField = (
      <Card className="border-[1px] border-slate-300 p-3 ">
        <div className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-bold text-lg">
              Dokumen Penunjukkan Dosen Pembimbing
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Silakan inputkan Link Gdrive dengan file harus berformat pdf.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label
              className="font-bold text-sm mt-1"
              htmlFor="surat-penunjukkan-dosen-pembimbing"
            >
              Link :{" "}
            </Label>
            <Input
              required
              key="surat-penunjukkan-dospem"
              onChange={(e) => setInputValue(e.target.value)}
              value={
                dataKPTerbaru?.level_akses > 8
                  ? dataKPTerbaru.link_surat_penunjukan_dospem || ""
                  : inputValue
              }
              readOnly={dataKPTerbaru?.level_akses > 8}
              className={`mt-1 text-black p-2 border-[1px] border-slate-300  ${
                dataKPTerbaru?.level_akses > 8 ? "hover:cursor-not-allowed" : ""
              }`}
              type="text"
              placeholder="Masukkan Link Berkas..."
              id="surat-penunjukkan-dosen-pembimbing"
              name="linkSuratPenunjukkanDosenPembimbingKP"
            />
          </CardContent>
        </div>
      </Card>
    );
  } else if (currentPage === 9 && dataKPTerbaru?.level_akses! >= 9) {
    url = `${
      import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
    }/mahasiswa/daftar-kp/unggah-surat-perpanjangan-kp`;
    InputField = (
      <Card className="border-[1px] border-slate-300 p-3 ">
        <div className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-bold text-lg">
              Pendaftaran KP Berhasil
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Silakan mengisi Daily Report Kerja Praktek
            </CardDescription>
          </CardHeader>
          {isPendaftaranKPLanjutClosed === false && isLanjutKPClicked && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs text-slate-500">
                  Silakan inputkan Link Gdrive dengan file harus berformat pdf.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Label
                  className="font-bold text-sm mt-1"
                  htmlFor="surat-perpanjangan-kp"
                >
                  Link :
                </Label>
                <Input
                  required
                  key="surat-perpanjangan-kp"
                  onChange={(e) => setInputValue(e.target.value)}
                  value={inputValue}
                  readOnly={dataKPTerbaru?.level_akses > 9}
                  className={`mt-1 text-black p-2 border-[1px] border-slate-300  ${
                    dataKPTerbaru?.level_akses > 9
                      ? "hover:cursor-not-allowed"
                      : ""
                  }`}
                  type="text"
                  placeholder="Masukkan Link Berkas..."
                  id="surat-perpanjangan-kp"
                  name="linkSuratPerpanjanganKP"
                />

                <Label
                  className="font-bold text-sm mt-1"
                  htmlFor="alasan-lanjut-kp"
                >
                  Alasan Lanjut KP :
                </Label>
                <Textarea
                  className="w-full  border-[1px] border-gray-300"
                  name="alasan_lanjut_kp"
                  id="alasan-lanjut-kp"
                ></Textarea>
              </CardContent>
            </Card>
          )}
          {!isLanjutKPClicked && (
            <>
              {" "}
              <Link
                to={{ pathname: "/mahasiswa/kerja-praktik/daily-report" }}
                className="text-center hover:cursor-pointer rounded-md bg-green-950 py-1 text-white font-bold tracking-wide my-3"
              >
                Pergi ke Halaman Daily Report
              </Link>
              {!isPendaftaranKPLanjutClosed && (
                <Button
                  onClick={() => setIsLanjutKPClicked((prev) => !prev)}
                  className="text-center hover:cursor-pointer rounded-md bg-green-950 py-1 text-white font-bold tracking-wide mt-2"
                >
                  Ajukan Perpanjangan Kerja Praktek
                </Button>
              )}
            </>
          )}
        </div>
      </Card>
    );
  }

  if (currentPage <= dataKPTerbaru?.level_akses!) {
  }

  return (
    <DashboardLayout>
      {dataKPTerbaru && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-2xl tracking-wide">
              Validasi Kelengkapan Berkas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {DataCardProgressKelengkapanBerkas.map((item, i) => {
                let status: boolean | undefined = false;

                if (dataKPTerbaru?.level_akses! >= i * 2 + 1) {
                  status = true;
                }

                return (
                  <CardProgressKelengkapanBerkas
                    key={i}
                    onClick={() => {
                      if (status) setCurrentPage(i * 2 + 1);
                    }}
                    text={item}
                    number={i + 1}
                    status={status}
                  />
                );
              })}
              {response && response.response && (
                <Card className="absolute left-1/2 py-2 -translate-x-1/2  w-80 bg-green-600 text-white">
                  <p className="text-center text-white font-semibold tracking-wide">
                    {response.message}
                  </p>
                </Card>
              )}
              {response && !response.response && (
                <Card className="absolute left-1/2 -translate-x-1/2  w-80 py-2 bg-green-600">
                  <p className="text-center text-white font-semibold tracking-wide">
                    {response.message}
                  </p>
                </Card>
              )}
            </div>
            <Card className={` ${statusValidasi.style} mt-4`}>
              <CardHeader>
                <CardTitle className="font-medium text-lg tracking-wide">
                  Status Validasi Surat Jawaban
                </CardTitle>
                <CardDescription className="mt-2 text-sm">
                  {":"} {statusValidasi.message}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="mt-2">
              <CardDescription className="p-3 font-bold text-black rounded-lg bg-green-200 dark:bg-black ">
                Silakan Isi Form di Bawah ini untuk Divalidasi!
              </CardDescription>
              <form
                onSubmit={handleOnSubmitForm(
                  url,
                  setIsLoading,
                  setResponse,
                  setDataKPTerbaru
                )}
              >
                <div className="dark:bg-black bg-green-100 p-3">
                  <CardTitle className="flex items-center gap-2 font-bold text-sm tracking-wide my-2">
                    <ClipboardList /> Validasi Berkas
                  </CardTitle>
                  {InputField}
                </div>
                {currentPage === dataKPTerbaru?.level_akses! &&
                  (dataKPTerbaru?.level_akses! !== 9 ||
                    (dataKPTerbaru.level_akses === 9 &&
                      isPendaftaranKPLanjutClosed === false &&
                      isLanjutKPClicked)) && (
                    <CardFooter className="flex justify-end items-center gap-2 mt-2">
                      <Button
                        onClick={() => setInputValue("")}
                        disabled={isLoading}
                        type="reset"
                        className=" px-16 tracking-wide py-1 font-semibold  hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Kosongkan Formulir
                      </Button>
                      <Button
                        disabled={isLoading}
                        type="submit"
                        className=" px-24 py-1 tracking-wide text-white font-medium  bg-green-950 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Kirim
                      </Button>
                    </CardFooter>
                  )}
              </form>
            </Card>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}

function handleOnSubmitForm(
  url: string,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setResponse: Dispatch<SetStateAction<CommonResponse | null>>,
  setDataKPTerbaru: Dispatch<SetStateAction<KPInterface>>
) {
  return async function handleOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading((prev) => !prev);
    const formData = new FormData(e.currentTarget);
    const objectFormData = Object.fromEntries(formData.entries());
    const axios = api();
    axios
      .post(url, {
        ...objectFormData,
      })
      .then((response) => {
        setIsLoading((prev) => !prev);
        setResponse(response.data);
        setDataKPTerbaru((prev) => {
          return { ...prev, level_akses: prev.level_akses + 1 };
        });
        const pointer = setTimeout(() => {
          setResponse(null);
          clearTimeout(pointer);
        }, 1000);
      })
      .catch((error) => {
        console.log(error);
      });
  };
}

// function FormSuratPengantar({url, isLoading, setIsLoading} : {isLoading : boolean, setIsLoading : Dispatch<SetStateAction<boolean>>, url : string}) {

//   return <form onSubmit={handleOnSubmitForm(url, setIsLoading)}>
//     <div className="bg-green-100 p-3">
//         <h4 className="font-bold text-sm tracking-wide my-2">< ClipboardList /> Validasi Berkas</h4>
//         <div className="border-[1px] border-slate-300 p-3 bg-white ">
//           <div className="flex flex-col">
//           <h3 className="font-bold text-lg">Dokumen Surat Pengantar dari Dekan</h3>
//           <p className="text-xs text-slate-500">Silakan inputkan Link Gdrive dengan file harus berformat pdf.</p>
//           <label className="font-bold text-sm mt-1" htmlFor="nama-pembimbing-instansi">Link : </label>
//           <input className="mt-1 p-2 border-[1px] border-slate-300  " type="text" placeholder="Masukkan Link Berkas..." id="nama-pembimbing-instansi" name="linkSuratPengantarKP"/>
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-end items-center mt-2">
//       <Button disabled={isLoading} type="reset" className=" px-16 tracking-wide py-1 font-semibold  hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Kosongkan Formulir</Button>
//       <button disabled={isLoading} type="submit" className=" px-24 py-1 tracking-wide text-white font-medium  bg-green-950 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Kirim</button>
//       </div>
//   </form>
// }

// function FormSuratBalasanInstansi({url} : {url : string}) {

//   return <form onSubmit={handleOnSubmitForm(url, setIsLoading)}>
//     <div className="bg-green-100 p-3">
//         <h4 className="font-bold text-sm tracking-wide my-2">< ClipboardList /> Validasi Berkas</h4>
//         <div className="border-[1px] border-slate-300 p-3 bg-white ">
//           <div className="flex flex-col">
//           <h3 className="font-bold text-lg">Dokumen Surat Pengantar dari Dekan</h3>
//           <p className="text-xs text-slate-500">Silakan inputkan Link Gdrive dengan file harus berformat pdf.</p>
//           <label className="font-bold text-sm mt-1" htmlFor="nama-pembimbing-instansi">Link : </label>
//           <input className="mt-1 p-2 border-[1px] border-slate-300 " type="text" placeholder="Masukkan Link Berkas..." id="nama-pembimbing-instansi" name="linkSuratPengantarKP"/>
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-end items-center mt-2">
//       <button disabled={isLoading} type="reset" className=" px-16 tracking-wide py-1 font-semibold  hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Kosongkan Formulir</button>
//       <button disabled={isLoading} type="submit" className=" px-24 py-1 tracking-wide text-white font-medium  bg-green-950 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Kirim</button>
//       </div>
//   </form>
// }

// function FormSuratBalasanInstansi1(url : string) {

//   return <form>
//     <div className="bg-green-100 p-3">
//         <h4 className="font-bold text-sm tracking-wide my-2">< ClipboardList /> Kontak Pembimbing Instansi</h4>
//         <div className="border-[1px] border-slate-300 p-3 bg-white ">
//           <div className="flex flex-col mt-2">
//           <label className="font-bold text-sm" htmlFor="nama-pembimbing-instansi">Nama Pembimbing Instansi</label>
//           <input className="p-1 border-[1px] border-slate-300 " type="text" placeholder="Nama Penanggung Jawab Instansi..." id="nama-pembimbing-instansi"/>
//           </div>
//           <div className="flex flex-col mt-2">
//           <label className="font-bold text-sm" htmlFor="email-resmi-pembimbing-instansi">Email Resmi Pembimbing Instansi</label>
//           <input className="p-1 border-[1px] border-slate-300 " type="text" placeholder="Nama Penanggung Jawab Instansi..." id="email-resmi-pembimbing-instansi"/>
//           </div>
//         </div>
//       </div>
//     </form>
// }
