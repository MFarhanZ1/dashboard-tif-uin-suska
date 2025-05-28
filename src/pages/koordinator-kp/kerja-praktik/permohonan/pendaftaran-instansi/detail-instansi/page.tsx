import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios-instance";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { Label } from "@/components/ui/label";

interface InstansiInterface {
  nama: string;
  id: string;
  alamat: string;
  longitude: number;
  latitude: number;
  jenis: string;
  profil_singkat: string;
  status: string;
  nama_pj: string;
  no_hp_pj: string;
}

function KoordinatorKerjaPraktikDetailInstansiPage() {
  const [dataInstansi, setDataInstansi] = useState<InstansiInterface | null>(
    null
  );
  const [isDeleteButtonClicked, setIsDeleteButtonClicked] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [namaInput, setNamaInput] = useState<string>("");
  const [jenisInput, setJenisInput] = useState<string>("");
  const [statusInput, setStatusInput] = useState<string>("");
  const [nama_pjInput, setNama_PjInput] = useState<string>("");
  const [no_hp_pjInput, setNo_Hp_PjInput] = useState<string>("");
  const [profil_singkatInput, setProfil_SingkatInput] = useState<string>("");
  const [alamatInput, setAlamatInput] = useState<string>("");
  const [latitudeInput, setLatitudeInput] = useState<number>(0);
  const [longitudeInput, setLongitudeInput] = useState<number>(0);

  const [radius, setRadius] = useState<number>(500);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async function () {
      const axios = api();
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
        }/koordinator-kp/daftar-kp/get-data-instansi/${id}`
      );

      setNamaInput(response.data.data.nama);
      setJenisInput(response.data.data.jenis);
      if (response.data.data.status === "Pending") {
        setStatusInput("Aktif");
      } else {
        setStatusInput(response.data.data.status);
      }
      setNama_PjInput(response.data.data.nama_pj);
      setNo_Hp_PjInput(response.data.data.no_hp_pj);
      setProfil_SingkatInput(response.data.data.profil_singkat);
      setAlamatInput(response.data.data.alamat);
      setLatitudeInput(response.data.data.latitude);
      setLongitudeInput(response.data.data.longitude);

      setDataInstansi(response.data.data);
      if (response.data.data.status === "Pending") {
        setIsEditing(() => true);
      }
    })();
  }, []);

  async function handleOnRejectOrDelete() {
    setIsLoading((prev) => !prev);
    const axios = api();
    const response = await axios.post(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/delete-data-instansi`,
      {
        id,
      }
    );

    setResponse(response.data.message as string);

    const pointer = setTimeout(function () {
      setResponse(null);
      navigate("/koordinator-kp/kerja-praktik/instansi");
      clearTimeout(pointer);
    }, 1000);
  }

  async function handleOnEdit() {
    setIsLoading((prev) => !prev);
    const axios = api();
    const response = await axios.post(
      `${
        import.meta.env.VITE_BASE_URL_KERJA_PRAKTIK
      }/koordinator-kp/daftar-kp/edit-data-instansi`,
      {
        id: id,
        status: statusInput,
        profil_singkat: profil_singkatInput,
        nama: namaInput,
        jenis: jenisInput,
        nama_pj: nama_pjInput,
        no_hp_pj: no_hp_pjInput,
        alamat: alamatInput,
        longitude: longitudeInput,
        latitude: latitudeInput,
        radius,
      }
    );

    setDataInstansi(response.data.data);
    setResponse(response.data.message);
    setIsLoading((prev) => !prev);
    setIsEditing((prev) => !prev);
    const pointer = setTimeout(function () {
      setResponse(null);
      clearTimeout(pointer);
    }, 1000);
  }

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLatitudeInput(e.latlng.lat);
        setLongitudeInput(e.latlng.lng);
      },
    });

    return (
      <Marker position={{ lat: latitudeInput, lng: longitudeInput }}>
        <Popup>You are here</Popup>
      </Marker>
    );
  }
  return (
    <DashboardLayout>
      {response && (
        <Card className="fixed z-[999] left-[50%] -translate-x-1/2 top-[20%] bg-green-600 rounded-lg p-4 text-white">
          {response}
        </Card>
      )}
      {isDeleteButtonClicked && (
        <Card>
          <CardHeader className="absolute z-50 bg-white left-[50%] -translate-x-[50%] -translate-y-[50%] top-[50%] border-[1px] border-black shadow-md rounded-lg p-4">
            <CardTitle>Apakah anda yakin?</CardTitle>
            <div className="flex gap-4 justify-end mt-4">
              <Button
                disabled={isLoading}
                onClick={() => setIsDeleteButtonClicked((prev) => !prev)}
                className="font-semibold"
              >
                Tidak
              </Button>
              <Button
                disabled={isLoading}
                onClick={handleOnRejectOrDelete}
                className="rounded-lg bg-red-600 p-2 text-white tracking-wide font-semibold w-20"
              >
                Ya
              </Button>
            </div>
          </CardHeader>
          <div
            onClick={() => setIsDeleteButtonClicked((prev) => !prev)}
            className="absolute z-40 w-screen h-screen"
          ></div>
        </Card>
      )}
      {dataInstansi !== null ? (
        <Card>
          <div className="flex gap-2">
            <div className="w-[50%]">
              <Card>
                <Card>
                  <CardContent>
                    <MapContainer
                      className="z-0 mt-6 rounded-lg"
                      center={[latitudeInput, longitudeInput]}
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ height: 600 }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <Circle
                        radius={radius}
                        center={{ lat: latitudeInput, lng: longitudeInput }}
                      />
                      <LocationMarker />
                    </MapContainer>
                    <Label className="text-sm font-bold" htmlFor="longitude">
                      Longitude
                    </Label>
                    <Input
                      className="text-black block w-full border-[1px] border-slate-300 rounded-md p-1 mb-4"
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={longitudeInput}
                      onChange={(e) =>
                        setLongitudeInput(parseFloat(e.currentTarget.value))
                      }
                    />

                    <Label className="text-sm font-bold" htmlFor="latitude">
                      Latitude
                    </Label>
                    <Input
                      className="text-black block w-full border-[1px] border-slate-300 rounded-md p-1 mb-4"
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={latitudeInput}
                      onChange={(e) =>
                        setLatitudeInput(parseFloat(e.currentTarget.value))
                      }
                    />
                    <Label className="text-sm font-bold" htmlFor="radius">
                      Radius
                    </Label>
                    <Input
                      className="text-black block w-full border-[1px] border-slate-300 rounded-md p-1 mb-4"
                      type="number"
                      id="radius"
                      name="radius"
                      value={radius}
                      onChange={(e) =>
                        setRadius(parseFloat(e.currentTarget.value) || 0)
                      }
                    />
                  </CardContent>
                </Card>
                <Card className="mt-4">
                  <CardContent>
                    <Label htmlFor="profil-singkat">Profil Singkat : </Label>
                    {isEditing ? (
                      <Textarea
                        id="profil-singkat"
                        className="w-full p-2 rounded-lg border-[1px] border-gray-300"
                        onChange={(e) =>
                          setProfil_SingkatInput(e.currentTarget.value)
                        }
                        value={
                          isEditing
                            ? profil_singkatInput || ""
                            : dataInstansi.profil_singkat || ""
                        }
                      />
                    ) : (
                      <Textarea
                        readOnly
                        value={dataInstansi.profil_singkat || ""}
                      />
                    )}
                  </CardContent>
                </Card>
              </Card>
            </div>
            <div className="flex-grow">
              <Card className="rounded-lg p-2 border-[1px] border-gray-200 shadow-md mb-6">
                <CardHeader>
                  <CardTitle className="tracking-wide font-bold text-lg">
                    {dataInstansi?.nama}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardTitle>Jenis Instansi: </CardTitle>
                  {isEditing ? (
                    <select
                      name="jenis-instansi"
                      id="jenis-instansi"
                      value={jenisInput}
                      onChange={(e) => setJenisInput(e.target.value)}
                    >
                      <option value="">Pilih Jenis</option>
                      <option value="UMKM">UMKM</option>
                      <option value="Pemerintahan">Pemerintahan</option>
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Swasta">Swasta</option>
                    </select>
                  ) : (
                    <CardDescription>{dataInstansi?.jenis}</CardDescription>
                  )}
                  <CardTitle>Status : </CardTitle>
                  {isEditing ? (
                    <select
                      name="status-instansi"
                      id="status-instansi"
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                    >
                      <option value="">Pilih Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Pending">Pending</option>
                      <option value="Tidak_Aktif">Tidak Aktif</option>
                    </select>
                  ) : (
                    <p>
                      {dataInstansi && dataInstansi.status.replace("_", " ")}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="rounded-lg p-2 border-[1px] border-gray-200 shadow-md mb-6">
                <CardHeader>
                  <CardTitle className="tracking-wide font-bold text-lg">
                    Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardTitle>Longitude : </CardTitle>
                  {isEditing ? (
                    <Input
                      className="rounded-lg border-[1px] border-gray-300 p-2"
                      onChange={(e) =>
                        setLongitudeInput(parseFloat(e.currentTarget.value))
                      }
                      type="text"
                      value={
                        isEditing ? longitudeInput : dataInstansi.longitude
                      }
                    />
                  ) : (
                    <CardDescription>{dataInstansi.longitude}</CardDescription>
                  )}
                  <CardTitle>Latitude : </CardTitle>
                  {isEditing ? (
                    <Input
                      className="rounded-lg border-[1px] border-gray-300 p-2"
                      onChange={(e) =>
                        setLatitudeInput(parseFloat(e.currentTarget.value))
                      }
                      type="text"
                      value={isEditing ? latitudeInput : dataInstansi.latitude}
                    />
                  ) : (
                    <CardDescription>{dataInstansi.latitude}</CardDescription>
                  )}
                  <CardTitle>Alamat : </CardTitle>
                  {isEditing ? (
                    <Input
                      className="rounded-lg border-[1px] border-gray-300 p-2"
                      onChange={(e) => setAlamatInput(e.currentTarget.value)}
                      type="text"
                      value={isEditing ? alamatInput : dataInstansi.alamat}
                    />
                  ) : (
                    <CardDescription>{dataInstansi.alamat}</CardDescription>
                  )}
                </CardContent>
              </Card>
              <Card className="rounded-lg p-2 border-[1px] border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="tracking-wide font-bold text-lg">
                    Penanggung Jawab
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardTitle>Nama Penanggung Jawab : </CardTitle>
                  {isEditing ? (
                    <Input
                      className="rounded-lg border-[1px] border-gray-300 p-2"
                      onChange={(e) => setNama_PjInput(e.currentTarget.value)}
                      type="text"
                      value={isEditing ? nama_pjInput : dataInstansi.nama_pj}
                    />
                  ) : (
                    <CardDescription>{dataInstansi?.nama_pj}</CardDescription>
                  )}
                  <CardTitle>Nomor Penanggung Jawab : </CardTitle>
                  {isEditing ? (
                    <Input
                      className="rounded-lg border-[1px] border-gray-300 p-2"
                      onChange={(e) => setNo_Hp_PjInput(e.currentTarget.value)}
                      type="text"
                      value={isEditing ? no_hp_pjInput : dataInstansi.no_hp_pj}
                    />
                  ) : (
                    <CardDescription>{dataInstansi?.no_hp_pj}</CardDescription>
                  )}
                </CardContent>
              </Card>
              <p></p>
            </div>
          </div>
          <CardFooter className="fixed left-0 right-0 py-3 pr-10 bottom-0 flex justify-end gap-4">
            {isEditing &&
              (dataInstansi?.status === "Pending" ? (
                <>
                  <Button
                    disabled={isLoading}
                    onClick={() => setIsDeleteButtonClicked((prev) => !prev)}
                    className="bg-red-600 p-2 rounded-lg text-white font-semibold tracking-wide"
                  >
                    Tolak Pengajuan
                  </Button>
                  <Button
                    disabled={isLoading}
                    onClick={handleOnEdit}
                    className="bg-green-600 p-2 rounded-lg text-white font-semibold tracking-wide"
                  >
                    Terima Pengajuan
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    disabled={isLoading}
                    onClick={() => setIsDeleteButtonClicked((prev) => !prev)}
                    className="bg-red-600 p-2 rounded-lg text-white font-semibold tracking-wide"
                  >
                    Hapus Instansi
                  </Button>
                  <Button
                    disabled={isLoading}
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="bg-green-600 p-2 rounded-lg text-white font-semibold tracking-wide"
                  >
                    Edit Instansi
                  </Button>
                </>
              ))}
            {isEditing && dataInstansi?.status !== "Pending" && (
              <>
                <Button
                  disabled={isLoading}
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="bg-red-600 p-2 rounded-lg text-white font-semibold tracking-wide"
                >
                  Batalkan
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={handleOnEdit}
                  className="bg-green-600 p-2 rounded-lg text-white font-semibold tracking-wide"
                >
                  Perbarui
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ) : (
        <CardDescription>Data Instansi Tidak Ditemukan.</CardDescription>
      )}
    </DashboardLayout>
  );
}

export default KoordinatorKerjaPraktikDetailInstansiPage;
