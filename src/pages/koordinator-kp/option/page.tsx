import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios-instance";
import { FormEvent, useEffect, useState } from "react";

interface tanggalDaftarKPInterface {
  tanggal_mulai_pendaftaran_kp: string;
  tanggal_akhir_pendaftaran_kp: string;
  tanggal_mulai_pendaftaran_kp_lanjut: string;
  tanggal_akhir_pendaftaran_kp_lanjut: string;
}

function OptionPage() {
  const [tanggalMulaiPendaftaran, setTanggalMulaiPendaftaran] =
    useState<string>("");
  const [tanggalAkhirPendaftaran, setTanggalAkhirPendaftaran] =
    useState<string>("");
  const [tanggalMulaiPendaftaranLanjut, setTanggalMulaiPendaftaranLanjut] =
    useState<string>("");
  const [tanggalAkhirPendaftaranLanjut, setTanggalAkhirPendaftaranLanjut] =
    useState<string>("");

  // useEffect(() => {
  //     (async function() {
  //         const response = await fetch("http://localhost:5000/koordinator-kp/daftar-kp/get-tanggal-daftar-kp");
  //         if (!response.ok) {
  //             throw new Error("Gagal mendapatkan data Tanggal Daftar KP");
  //         }

  //         const data = (await response.json()).data as tanggalDaftarKPInterface;

  //         setTanggalMulaiPendaftaran(data.tanggal_mulai_pendaftaran_kp)
  //     })()
  // }, [])

  // console.log(new Date((tanggalMulaiPendaftaran as Date)?.toISOString()))

  async function handleOnSubmitTanggalPendaftaranKP(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    const object = new FormData(e.currentTarget);
    const data = Object.fromEntries(object.entries());
    const axios = api();
    await axios.post(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/post-tanggal-daftar-kp`,
      {
        tanggalMulai: new Date(
          data.tanggalMulaiPendaftaranKp as string
        ).toISOString(),
        tanggalTerakhir: new Date(
          data.tanggalAkhirPendaftaranKp as string
        ).toISOString(),
      }
    );
  }

  async function handleOnSubmitTanggalPendaftaranLanjutKP(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    const object = new FormData(e.currentTarget);
    const data = Object.fromEntries(object.entries());
    const axios = api();
    await axios.post(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/post-tanggal-daftar-kp-lanjut`,
      {
          tanggalMulai: new Date(
            data.tanggalMulaiPendaftaranLanjutKp as string
          ).toISOString(),
          tanggalTerakhir: new Date(
            data.tanggalAkhirPendaftaranLanjutKp as string
          ).toISOString(),
      }
    );
  }

  return (
    <DashboardLayout>
      <Card className="shadow-lg p-2">
        <CardHeader>
          <CardTitle className="font-bold text-lg tracking-wide">
            Pendaftaran Kerja Praktek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Tanggal Pendaftaran</p>
          <form onSubmit={handleOnSubmitTanggalPendaftaranKP} className="mb-4">
            <Label htmlFor="tanggal-mulai-pendaftaran-kp">
              Tanggal Mulai :{" "}
            </Label>
            <Input
              className="border[1px] border-gray-300 rounded-lg p-1"
              value={tanggalMulaiPendaftaran}
              onChange={(e) =>
                setTanggalMulaiPendaftaran(e.currentTarget.value.toString())
              }
              type="date"
              id="tanggal-mulai-pendaftaran-kp"
              name="tanggalMulaiPendaftaranKp"
            />
            <Label htmlFor="tanggal-terakhir-pendaftaran-kp">
              Tanggal Terakhir :{" "}
            </Label>
            <Input
              className="border[1px] border-gray-300 rounded-lg p-1"
              value={tanggalAkhirPendaftaran}
              onChange={(e) =>
                setTanggalAkhirPendaftaran(e.currentTarget.value.toString())
              }
              type="date"
              id="tanggal-terakhir-pendaftaran-kp"
              name="tanggalTerakhirPendaftaranKp"
            />
            <Button className="rounded-lg border-[1px] border-gray-300 p-2">
              submit
            </Button>
          </form>
          <form onSubmit={handleOnSubmitTanggalPendaftaranLanjutKP}>
            <Label htmlFor="tanggal-mulai-pendaftaran-lanjut-kp">
              Tanggal Mulai :{" "}
            </Label>
            <Input
              className="border[1px] border-gray-300 rounded-lg p-1"
              value={tanggalMulaiPendaftaranLanjut}
              onChange={(e) =>
                setTanggalMulaiPendaftaranLanjut(
                  e.currentTarget.value.toString()
                )
              }
              type="date"
              id="tanggal-mulai-pendaftaran-lanjut-kp"
              name="tanggalMulaiPendaftaranLanjutKp"
            />
            <Label htmlFor="tanggal-akhir-pendaftaran-lanjut-kp">
              Tanggal Terakhir :{" "}
            </Label>
            <Input
              className="border[1px] border-gray-300 rounded-lg p-1"
              value={tanggalAkhirPendaftaranLanjut}
              onChange={(e) =>
                setTanggalAkhirPendaftaranLanjut(
                  e.currentTarget.value.toString()
                )
              }
              type="date"
              id="tanggal-akhir-pendaftaran-lanjut-kp"
              name="tanggalTerakhirPendaftaranLanjutKp"
            />
            <Button className="rounded-lg border-[1px] border-gray-300 p-2">
              submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default OptionPage;
