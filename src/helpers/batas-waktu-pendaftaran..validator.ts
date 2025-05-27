import { api } from "@/lib/axios-instance";

interface tanggalKPInterface {
  tanggal_mulai_pendaftaran_kp?: Date;
  tanggal_akhir_pendaftaran_kp?: Date;
  tanggal_mulai_pendaftaran_kp_lanjut?: Date;
  tanggal_akhir_pendaftaran_kp_lanjut?: Date;
}

export async function IsPendaftaranKPClosed(): Promise<boolean | null> {
  const axios = api();
  const response = await axios.get(
    `${
      import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
    }/koordinator-kp/daftar-kp/get-tanggal-daftar-kp`
  );

  const tanggalKP = response.data;

  if (
    tanggalKP.tanggal_akhir_pendaftaran_kp === null ||
    tanggalKP.tanggal_akhir_pendaftaran_kp === undefined ||
    tanggalKP.tanggal_akhir_pendaftaran_kp.getTime() - new Date().getTime() <= 0
  ) {
    return true;
  }
  return false;
}

export async function IsPendaftaranKPLanjutClosed(): Promise<boolean | null> {
  const axios = api();
  const response = await axios.get(
    `${
      import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
    }/koordinator-kp/daftar-kp/get-tanggal-daftar-kp`
  );

  const tanggalKP = response.data.data;

  if (
    tanggalKP.tanggal_akhir_pendaftaran_kp_lanjut === null ||
    tanggalKP.tanggal_akhir_pendaftaran_kp_lanjut === undefined ||
    new Date(tanggalKP.tanggal_akhir_pendaftaran_kp_lanjut).getTime() <
      new Date().getTime()
  ) {
    return true;
  }
  return false;
}
