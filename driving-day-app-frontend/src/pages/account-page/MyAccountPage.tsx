import React, { useEffect, useContext, useCallback } from 'react';
import PageBase from '../../components/base-components/PageBase';
import { SpecificDriverProfile } from '../../components/driver-components/SpecificDriverProfile';
import './MyAccountPage.css';
import { getSpecificDriver } from '../../api/api';
import AppDataContext from "../../components/contexts/AppDataContext";
import { handleGoogleLogin } from '../../controllers/AuthController';

const MyAccountPage : React.FC = () => {

  const {currUserId, setCurrUserId, currUser, setCurrUser} = useContext(AppDataContext)

  const performLogin = async () => {
    try{
      const email = await handleGoogleLogin();
      setCurrUserId(email);
    }
    catch(error){
      console.error(error)
    }
  }

  const fetchSpecificDriver = useCallback(async () => {
    if (currUserId) {
      const response = await getSpecificDriver({
        driverId: currUserId
      })
      if (response.status === 200 && response.data.driver) {
        setCurrUser(response.data.driver)
      }
    }
  }, [currUserId, setCurrUser])

  useEffect(() => {
    fetchSpecificDriver();
  }, [currUserId])

  return (
    <PageBase>
      <h1>My Account</h1>
      {currUserId 
        ? <SpecificDriverProfile driver={currUser}/>
        : (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <button
                onClick={performLogin}
                className="flex px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow hover:bg-gray-50 flex items-center justify-center gap-2 mx-auto"
              >
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="w-5 h-5" 
                />
                Sign in with Google
              </button>
          </div>
        )
      }

      <div className='w-full py-8'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="sm:hidden p-4 text-sm text-gray-500">
              No linked issues yet.
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[420px] font-face table-fixed">
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "42%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-base sm:px-6 sm:py-4 sm:text-lg">Issue #</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6 sm:py-4">Date</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6 sm:py-4">Synop.</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6 sm:py-4">Subsys.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-sm text-gray-500 sm:px-6">
                      No linked issues yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="sm:hidden p-4 text-sm text-gray-500">
              No linked runs yet.
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[360px] font-face table-fixed">
                <colgroup>
                  <col style={{ width: "60%" }} />
                  <col style={{ width: "40%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-base sm:px-6 sm:py-4 sm:text-lg">Run Title</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6 sm:py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-sm text-gray-500 sm:px-6">
                      No linked runs yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageBase>
  );
}

export default MyAccountPage;


