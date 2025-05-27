import { api } from "@/lib/axios-instance";

export default class APIDaftarKP {
  static async getAllPermohonanMahasiswa() {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/get-data-kp`
    );
    const data = response.data;
    return data;
  }

  static async postDataInstansi(
    objectFormData: any,
    position: any,
    radius: any
  ) {
    const axios = api();
    const response = await axios.post(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/mahasiswa/daftar-kp/pendaftaran-instansi`,
      {
        namaInstansi: objectFormData.namaInstansi,
        alamatInstansi: objectFormData.alamatInstansi,
        jenisInstansi: objectFormData.jenisInstansi,
        emailPenanggungJawabInstansi:
          objectFormData.emailPenanggungJawabInstansi,
        namaPenanggungJawabInstansi: objectFormData.namaPenanggungJawabInstansi,
        telpPenanggungJawabInstansi: objectFormData.telpPenanggungJawabInstansi,
        profilInstansi: objectFormData.profilInstansi,
        longitude: position.lng,
        latitude: position.lat,
        radius,
      }
    );
    const data = response.data;
    return data;
  }

  static async getKPTerbaruMahasiswa() {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/mahasiswa/daftar-kp/kp-aktif-mahasiswa`
    );
    const data = response.data;
    return data;
  }

  static async getRiwayatKP() {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/mahasiswa/daftar-kp/riwayat-pendaftaran-kp`
    );
    const data = response.data;
    return data;
  }

  static async getTanggalDaftarKP() {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/get-tanggal-daftar-kp`
    );
    const data = response.data;
    return data;
  }
  public static async getKPAktifMahasiswa() {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/mahasiswa/daftar-kp/kp-aktif-mahasiswa`
    );
    const data = response.data;
    return data;
  }
  public static async getDataInstansiAktif() {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/mahasiswa/daftar-kp/data-instansi`
    );
    const data = response.data;
    return data;
  }

  public static async getDetailDataInstansi(id: string) {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/get-data-instansi/${id}`
    );
    const data = response.data;
    return data;
  }

  public static async getAllDataInstansi() {
    const axios = api();
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/get-all-data-instansi`
    );
    const data = response.data;
    return data;
  }

  //   public static async getKartuMurojaahSaya() {
  //     const axios = api();
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_BASE_URL_SETORAN_HAFALAN}/mahasiswa/kartu-murojaah-saya`,
  //       { responseType: "arraybuffer" }
  //     );
  //     return response;
  //   }
}
