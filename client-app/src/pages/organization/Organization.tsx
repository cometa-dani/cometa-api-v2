import { FC, useEffect, useState } from 'react';
import { Form, useParams } from 'react-router-dom';
import { useMutationCreateLocation, useQueryGetOrganizationById } from '../../queries/organizationQueries';
import { defaultImg, mapTileLayer } from '../../constants';
import { Modal } from '../../components';
import { Field, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet';
import "leaflet/dist/leaflet.css";


type CreateLocation = {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
};


const createLocation = Yup.object({
  name: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  latitude: Yup.string().required('Required'),
  longitude: Yup.string().required('Required'),
});

const initialValues = {
  name: '',
  description: '',
  latitude: '',
  longitude: ''
};


export const Organization: FC = () => {
  const organizationID: string = useParams()['id'] ?? '';
  const { data: organizationsData, isSuccess } = useQueryGetOrganizationById(organizationID);
  const mutateOrganization = useMutationCreateLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // event-handler
  const handleToggleModal = () => setIsModalOpen(prev => !prev);

  // event-handler
  const handleCreateOrganization = async (values: CreateLocation, actions: FormikHelpers<CreateLocation>) => {
    try {
      mutateOrganization.mutate({ organizationId: organizationID, location: values });

      actions.resetForm();
      actions.setSubmitting(false);
      handleToggleModal();
    }
    catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="max-w-[70rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">

      <h3 className='text-3xl font-bold text-center pb-12'>{organizationsData?.name}</h3>

      {/* <!-- Card Section --> */}
      <div className="max-w-[85rem] mx-auto pb-12">
        {/* <!-- Grid --> */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* <!-- Card --> */}
          <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-800">
            <div className="p-4 md:p-5 flex justify-between gap-x-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Total users
                </p>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-200">
                    72,540
                  </h3>
                  <span className="flex items-center gap-x-1 text-green-600">
                    <svg className="inline-block w-5 h-5 self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                    <span className="inline-block text-lg">
                      1.7%
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex justify-center items-center w-[46px] h-[46px] bg-blue-600 text-white rounded-full dark:bg-blue-900 dark:text-blue-200">
                <svg className="flex-shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>

            <a className="py-3 px-4 md:px-5 inline-flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 hover:bg-gray-50 rounded-b-xl dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="#">
              View reports
              <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </div>
          {/* <!-- End Card --> */}

          {/* <!-- Card --> */}
          <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-800">
            <div className="p-4 md:p-5 flex justify-between gap-x-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Sessions
                </p>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="mt-1 text-xl font-medium text-gray-800 dark:text-gray-200">
                    29.4%
                  </h3>
                </div>
              </div>
              <div className="flex-shrink-0 flex justify-center items-center w-[46px] h-[46px] bg-blue-600 text-white rounded-full dark:bg-blue-900 dark:text-blue-200">
                <svg className="flex-shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" /><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" /></svg>
              </div>
            </div>

            <a className="py-3 px-4 md:px-5 inline-flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 hover:bg-gray-50 rounded-b-xl dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="#">
              View reports
              <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </div>
          {/* <!-- End Card --> */}

          {/* <!-- Card --> */}
          <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-800">
            <div className="p-4 md:p-5 flex justify-between gap-x-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Avg. Click Rate
                </p>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-200">
                    56.8%
                  </h3>
                  <span className="flex items-center gap-x-1 text-red-600">
                    <svg className="inline-block w-4 h-4 self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>
                    <span className="inline-block text-lg">
                      1.7%
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex justify-center items-center w-[46px] h-[46px] bg-blue-600 text-white rounded-full dark:bg-blue-900 dark:text-blue-200">
                <svg className="flex-shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" /><path d="m12 12 4 10 1.7-4.3L22 16Z" /></svg>
              </div>
            </div>

            <a className="py-3 px-4 md:px-5 inline-flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 hover:bg-gray-50 rounded-b-xl dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="#">
              View reports
              <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </div>
          {/* <!-- End Card --> */}

          {/* <!-- Card --> */}
          <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-800">
            <div className="p-4 md:p-5 flex justify-between gap-x-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Pageviews
                </p>
                <div className="mt-1 flex items-center gap-x-2">
                  <h3 className="mt-1 text-xl font-medium text-gray-800 dark:text-gray-200">
                    92,913
                  </h3>
                </div>
              </div>
              <div className="flex-shrink-0 flex justify-center items-center w-[46px] h-[46px] bg-blue-600 text-white rounded-full dark:bg-blue-900 dark:text-blue-200">
                <svg className="flex-shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z" /><path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /><path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" /><path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" /></svg>
              </div>
            </div>

            <a className="py-3 px-4 md:px-5 inline-flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 hover:bg-gray-50 rounded-b-xl dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="#">
              View reports
              <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </div>
          {/* <!-- End Card --> */}
        </div>
        {/* <!-- End Grid --> */}
      </div>
      {/* <!-- End Card Section --> */}

      <Modal header='Create new location' isOpen={isModalOpen} handleTransition={handleToggleModal} >
        <section className="sm:py-2">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 sm:text-3xl dark:text-white">
              Ready?
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Tell us your story and we’ll be in touch.
            </p>
          </div>

          {/* <!-- Form --> */}
          <Formik initialValues={initialValues} validationSchema={createLocation} onSubmit={handleCreateOrganization}>
            {({ setFieldValue, values }) => (
              <Form>
                <ul className="grid gap-4 lg:gap-6">
                  {/* <!-- Grid --> */}
                  <li className="grid grid-cols-1 gap-4 lg:gap-6">
                    <div>
                      <label htmlFor="name" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Name</label>
                      <Field
                        placeholder="Enter name"
                        type="text"
                        name="name"
                        id="name"
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                      />
                    </div>
                  </li>
                  {/* <!-- End Grid --> */}

                  <li>
                    <label htmlFor="description" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Description</label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      placeholder="Enter description"
                      rows={3}
                      className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                    />
                  </li>

                  {/* <LocationMarker /> */}
                  <div className='relative'>

                    <label className='block mb-2 text-sm text-gray-700 font-medium dark:text-white'>Select your location</label>

                    <div className='relative h-96 w-full rounded-md overflow-hidden'>
                      <MapContainer
                        id='map'
                        center={[0, 0]}
                        zoom={16}
                        minZoom={10}
                        scrollWheelZoom={false}
                        className='absolute h-full w-full z-0'
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url={mapTileLayer}
                          className='relative z-0'
                        />
                        <LocationMarker
                          name={values.name}
                          onLatLngChange={
                            (latLng: [number, number]) => {
                              setFieldValue('latitude', latLng[0]);
                              setFieldValue('longitude', latLng[1]);
                            }
                          }
                        />
                      </MapContainer>
                    </div>

                    <li className='w-[420px] px-4 absolute top-10 right-0 z-50 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6'>
                      <div>
                        <label htmlFor="latitude" className='block mb-2 text-sm text-gray-700 font-medium dark:text-white'>
                          Latitude
                        </label>
                        <Field
                          disabled
                          type="number"
                          placeholder="Enter latitude"
                          name="latitude"
                          id="latitude"
                          className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                        />
                      </div>
                      <div>
                        <label htmlFor="longitude" className='block mb-2 text-sm text-gray-700 font-medium dark:text-white'>
                          Longitude
                        </label>
                        <Field
                          disabled
                          type="number"
                          name="longitude"
                          placeholder="Enter longitude"
                          id="longitude"
                          className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                        />
                      </div>
                    </li>
                  </div>
                </ul>
                {/* <!-- End Grid --> */}

                <div className="mt-6 grid">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 inline-flex justify-center items-center gap-x-2  font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  >
                    Create Location
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500">
                    We'll get back to you in 1-2 business days.
                  </p>
                </div>
              </Form>
            )}
          </Formik>
          {/* <!-- End Form --> */}

          {/* <p className="mt-4 text-xs text-gray-500">
              Completely unstyled, fully accessible UI <a className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline font-medium" href="../plugins.html">plugins</a> for popular features that for one reason or another don't belong in core.
            </p> */}
        </section>
      </Modal>

      {/* <!-- TABLE --> */}
      {isSuccess && (
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700">
                {/* <!-- Header --> */}
                <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Locations
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add Locations, edit and more.
                    </p>
                  </div>

                  {/* search input */}
                  <div className="sm:col-span-1">
                    <label htmlFor="hs-as-table-product-review-search" className="sr-only">Search</label>
                    <div className="relative">
                      <input type="text" id="hs-as-table-product-review-search" name="hs-as-table-product-review-search" className="py-2 px-3 ps-11 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" placeholder="Search" />
                      <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* search input */}

                  {/* add button */}
                  <div className="inline-flex gap-x-2">
                    <button
                      type="button"
                      onClick={handleToggleModal}
                      data-hs-overlay="#hs-bg-gray-on-hover-cards"
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    >
                      <svg className="flex-shrink-0 w-3 h-3" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2.63452 7.50001L13.6345 7.5M8.13452 13V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Add location
                    </button>
                  </div>
                  {/* add button */}
                </div>
                {/* <!-- End Header --> */}

                {/* <!-- Table --> */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Name
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Description
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Created
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Status
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                    {organizationsData?.locations.length > 0 ?
                      organizationsData?.locations.map((location) => (
                        <tr
                          // onClick={() => navigate(`/organization/${location.id}`)}
                          key={location.id}
                          className="cursor-pointer bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                          <td className="h-px w-px whitespace-nowrap align-top">
                            <div className="block p-6">
                              <div className="flex items-center gap-x-3">
                                <img className="inline-block h-[2.375rem] w-[2.375rem] rounded-full" src={location.mediaUrls?.[0] || defaultImg} alt="Image Description" />
                                <div className="grow">
                                  <span className="w-52 overflow-hidden overflow-ellipsis whitespace-nowrap block text-sm font-semibold text-gray-800 dark:text-gray-200">{location.name}</span>
                                  <span className="w-52 overflow-hidden overflow-ellipsis whitespace-nowrap block text-sm text-gray-500">{organizationsData.name}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="h-px w-72 min-w-[18rem] align-top">
                            <div className="block p-6">
                              <div className="flex gap-x-1 mb-2">
                                <svg className="flex-shrink-0 w-3 h-3 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                                <svg className="flex-shrink-0 w-3 h-3 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                                <svg className="flex-shrink-0 w-3 h-3 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                                <svg className="flex-shrink-0 w-3 h-3 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                                <svg className="flex-shrink-0 w-3 h-3 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                              </div>

                              {/* <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">I just love it!</span> */}
                              <span className="w-72 overflow-hidden overflow-ellipsis whitespace-nowrap block text-sm text-gray-500">{location.description || 'Lorem Ipsum'}</span>
                            </div>
                          </td>

                          <td className="h-px w-px whitespace-nowrap align-top">
                            <div className="block p-6">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(location.createdAt).toLocaleString()}</span>
                            </div>
                          </td>

                          <td className="h-px w-px whitespace-nowrap align-top">
                            <div className="block p-6">
                              <span className="py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full dark:bg-teal-500/10 dark:text-teal-500">
                                <svg className="w-2.5 h-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                </svg>
                                Published
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                      : (
                        <tr>
                          <td className='p-7 w-full'>No data available yet!</td>
                        </tr>
                      )}
                  </tbody>
                </table>
                {/* <!-- End Table --> */}

                {/* <!-- Footer --> */}
                <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-gray-700">
                  <div className="max-w-sm space-y-3">
                    <select defaultValue={1} className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400">
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>

                  <div>
                    <div className="inline-flex gap-x-2">
                      <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                        <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Prev
                      </button>

                      <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                        Next
                        <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                {/* <!-- End Footer --> */}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <!-- TABLE --> */}
    </div>
  );
};


interface LocationMarkerProps {
  name?: string;
  onLatLngChange?: (latLng: [number, number]) => void;
}

const LocationMarker: FC<LocationMarkerProps> = ({ name, onLatLngChange }) => {
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLatLngChange?.([e.latlng.lat, e.latlng.lng]);
    },
    locationfound(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.setView([e.latlng.lat, e.latlng.lng], map.getZoom());
    },
    locationerror(e) {
      alert(e.message);
    },
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ?
    null : (
      <Marker position={position}>
        <Popup>{name}</Popup>
      </Marker>
    );
};
