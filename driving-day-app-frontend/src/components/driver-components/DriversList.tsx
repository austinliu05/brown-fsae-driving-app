import React, { useState, useContext } from "react";
import { Driver } from "../../utils/DriverType";
import { SpecificDriverProfile } from "./SpecificDriverProfile";
import AppDataContext from "../contexts/AppDataContext";

// TODO: Move this to DriversPage.tsx
const DriversList = () => {

  const { drivers, isLoading } = useContext(AppDataContext)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading drivers...
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Driver Profiles</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
          <div className="drivers-list rounded-lg border border-gray-200 bg-white">
            <div className="sm:hidden space-y-2 p-2">
              {drivers.map((driver, index) => {
                const isSelected = selectedDriver?.driverId === driver.driverId;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedDriver(driver)}
                    className={`w-full text-left rounded-md border p-3 ${
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{driver.firstName} {driver.lastName}</p>
                    <p className="mt-1 text-xs text-gray-600">Height: {driver.height} cm</p>
                    <p className="mt-1 text-xs text-gray-600">Weight: {driver.weight} kg</p>
                    <p className="mt-1 text-xs text-gray-600">Pedal Box: {driver.pedalBoxPos}</p>
                  </button>
                )
              })}
            </div>

            <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-100 border-none">
                <tr>
                  <th className="border p-3 text-left sm:p-4">Name</th>
                  <th className="border p-3 text-left sm:p-4">Height (cm)</th>
                  <th className="border p-3 text-left sm:p-4">Weight (kg)</th>
                  <th className="border p-3 text-left sm:p-4">Pedal Box Position</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedDriver(driver)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="border p-3 text-[#24a0ed] sm:p-4">
                      {`${driver.firstName} ${driver.lastName}`}
                    </td>
                    <td className="border p-3 sm:p-4">{driver.height}</td>
                    <td className="border p-3 sm:p-4">{driver.weight}</td>
                    <td className="border p-3 sm:p-4">{driver.pedalBoxPos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          <div className="selected-driver">
            {selectedDriver ? (
              // <SpecificDriverProfile driver={selectedDriver} />
              <div>
                  <div className="justify-center bg-white border rounded-lg shadow-lg flex flex-col items-center w-full">
                    <SpecificDriverProfile driver={selectedDriver} />
                  </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                Select a driver to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DriversList;
