// import Link from "next/link";
// import {useRouter} from "next/navigation"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import APIDaftarKP from "@/services/api/mahasiswa/daftar-kp.service";
import { api } from "@/lib/axios-instance";

interface CommonResponse {
  response: boolean;
  message: string;
}

function MahasiswaKerjaPraktekDaftarKpPermohonanFromPendaftaranPage() {
  // const [dataInstansi, setDataInstansi] = useState([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<CommonResponse | null>(null);
  const [date, setDate] = useState<Date>();
  const navigate = useNavigate();

  const { data: dataInstansi, isLoading } = useQuery({
    queryKey: ["instansi-aktif"],
    queryFn: () => APIDaftarKP.getDataInstansiAktif().then((res) => res.data),
  });

  // useEffect(() => {
  //   (async function () {
  //     const response = await fetch(
  //       `${"http://localhost:5000"}/mahasiswa/daftar-kp/data-instansi`
  //     );
  //     const data = await response.json();
  //     console.log(data.data);
  //     setDataInstansi(data.data);
  //   })();
  // }, []);

  async function handleOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const objectFormData = Object.fromEntries(formData.entries());
    try {
      const axios = api();
      axios
        .post(
          `${
            import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
          }/mahasiswa/daftar-kp/pendaftaran-kp`,
          {
            tanggalMulai: date?.toISOString(),
            tujuanSuratInstansi: objectFormData.tujuanSuratInstansi,
            idInstansi: objectFormData.idInstansi,
          }
        )
        .then((res) => {
          setResponse(res.data);
          const pointer = setTimeout(() => {
            setResponse(null);
            clearTimeout(pointer);
          }, 1000);
          // console.log("tes4")
          navigate("/mahasiswa/kerja-praktik/daftar-kp/permohonan");
        })
        .catch((error) => console.log(error));
    } catch (e) {
      throw new Error("Data tanggal tidak valid");
    }
  }

  async function handleOnCancel() {
    navigate("/mahasiswa/kerja-praktik/daftar-kp/permohonan");
  }

  return (
    <DashboardLayout>
      <Card>
        <form onSubmit={handleOnSubmit}>
          {response && response.response && (
            <Card className="fixed left-1/2 py-2 -translate-x-1/2 w-80 bg-green-600 text-white">
              <CardDescription className="text-center text-white font-semibold tracking-wide">
                {response.message}
              </CardDescription>
            </Card>
          )}
          {response && !response.response && (
            <Card className="absolute left-1/2 -translate-x-1/2 w-80 py-2 bg-green-600">
              <CardDescription className="text-center text-white font-semibold tracking-wide">
                {response.message}
              </CardDescription>
            </Card>
          )}
          <CardHeader>
            <CardTitle className="text-center font-bold text-2xl">
              Form Pendaftaran Kerja Praktek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardTitle className="font-bold text-lg">
              🏢 Instansi/Perusahaan
            </CardTitle>
            <Label className="text-sm font-bold mt-6" htmlFor="instansi">
              Nama Instansi / Perusahaan
            </Label>
            <CardContent className="text-black bg-white p-0 rounded-md border-black border-[1px]">
              <select
                className="bg-white block w-[100%] p-2"
                name="idInstansi"
                id="instansi"
              >
                <option value="">Pilih Instansi</option>
                {dataInstansi?.map(({ id, nama }) => (
                  <option key={id} value={id}>
                    {nama}
                  </option>
                ))}
              </select>
            </CardContent>
            <CardDescription className="text-sm text-slate-500">
              Instansi belum terdaftar? Daftarkan segera{" "}
              <Link
                className="text-blue-500"
                to={{
                  pathname:
                    "/mahasiswa/kerja-praktik/daftar-kp/permohonan/form-daftar-instansi",
                }}
              >
                Disini
              </Link>
            </CardDescription>
          </CardContent>

          <CardContent>
            <Label className="text-sm font-bold" htmlFor="tujuan-surat">
              Tujuan Surat Instansi/Perusahaan
            </Label>
            <Textarea
              className="text-black block bg-white w-full p-2 border-slate-300 border-[1px] h-42"
              name="tujuanSuratInstansi"
              id="tujuan-surat"
              placeholder="Masukkan tujuan instansi disini..."
            ></Textarea>
          </CardContent>

          <CardContent className="w-fit">
            <Label className="text-sm font-bold" htmlFor="tanggal-mulai">
              Tanggal Mulai
            </Label>
            <Calendar
              className="text-black bg-white w-full p-2 border-slate-300 border-[1px]"
              id="tanggal-mulai"
              onDayClick={(e) => setDate(e)}
              selected={date}
            />
          </CardContent>

          <CardFooter className="text-end mt-4 sm:flex sm:flex-col sm:gap-2 md:block">
            <Button
              onClick={handleOnCancel}
              type="button"
              disabled={isLoading}
              className="md:mr-4  py-1 md:w-[198px] font-bold border-black border-[1px] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 py-1 md:w-[198px] font-bold hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ajukan Permohonan
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardLayout>
  );
}

export default MahasiswaKerjaPraktekDaftarKpPermohonanFromPendaftaranPage;
