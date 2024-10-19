import { ChangeEventHandler, FC, useRef, useState } from 'react';
import { useMutationCreateOrganization, useQueryGetAllOrganizations } from '../../queries/organizationQueries';
import { defaultImg } from '../../constants';
import { Modal } from '../../components';
import { useNavigate } from 'react-router-dom';
import { Form, Formik, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Organization } from '../../models/Organization.model';


type CreateOrganization = Partial<Organization>;

const createOrganization = Yup.object<CreateOrganization>({
  name: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
  description: Yup.string().required('Required'),
  // mediaUrl: Yup.string().required('Required'),
  phone: Yup.string().required('Required'),

  // optional
  webPage: Yup.string().url('Invalid url').optional().default(undefined),
  instagramPage: Yup.string().optional().default(undefined),
  facebookPage: Yup.string().optional().default(undefined),
});


const initialValues: CreateOrganization = {
  name: '',
  password: '123456',
  email: '',
  description: '',
  phone: '',
  // mediaUrl: '',
  webPage: undefined,
  instagramPage: undefined,
  facebookPage: undefined,
};


export const Home: FC = () => {
  // navigation
  const navigate = useNavigate();

  // data-fetching
  const { data: organizationsData, isSuccess } = useQueryGetAllOrganizations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mutateOrganization = useMutationCreateOrganization();

  // image upload for preview
  const [logoImgUrl, setLogoImgUrl] = useState('');
  const logoFileRef = useRef<File>();

  // event-handler
  const handleToggleModal = () => setIsModalOpen(prev => !prev);

  // event-handler
  const handleCreateOrganization = async (values: CreateOrganization, actions: FormikHelpers<CreateOrganization>) => {
    try {
      if (actions && logoFileRef.current) {
        mutateOrganization.mutate({ organization: values, imgFile: logoFileRef.current });
      }
      if (actions && !logoFileRef.current) {
        mutateOrganization.mutate({ organization: values });
      }
      else return;

      actions.resetForm();
      actions.setSubmitting(false);
      logoFileRef.current = undefined;
      handleToggleModal();
    }
    catch (error) {
      console.log(error);
    }
  };

  // event-handler for file upload
  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = async (e) => {
    logoFileRef.current = e.target.files?.[0] as File;
    const readableFile = await readFileAsString(logoFileRef.current);

    // TODO: in this step, the data in the form is reset,
    // so we need to find a way to keep the data
    setLogoImgUrl(readableFile);
  };

  // helper function for file upload
  const readFileAsString = (file: File): Promise<string> => {
    if (file.type && !file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }
    const reader = new FileReader();
    // promisify event handler
    const readableFile = new Promise<string>((resolve) => {
      reader.addEventListener('load', (e) => {
        const result = e.target?.result as string;
        resolve(result);
      },
        { once: true }
      );
    });
    reader.readAsDataURL(file); // this triggers the event handler

    return readableFile;
  };


  return (
    <div className="max-w-[70rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">

      <Modal header='Create new organization' isOpen={isModalOpen} handleTransition={handleToggleModal} >
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
          <Formik initialValues={initialValues} validationSchema={createOrganization} onSubmit={handleCreateOrganization}>
            {() => (
              <Form>
                <ul className="grid gap-4 lg:gap-6">
                  {/* <!-- Grid --> */}
                  <li className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label htmlFor="name" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Name</label>
                      <Field
                        type="text"
                        name="name"
                        id="name"
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Email</label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                      />
                    </div>
                  </li>
                  {/* <!-- End Grid --> */}

                  <li className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 items-center'>
                    <div>
                      <label htmlFor="logo" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Logo</label>
                      <input
                        className='hidden'
                        onChange={handleFileUpload}
                        type="file"
                        id="logo"
                      />
                      <input
                        type="button"
                        value='Upload'
                        onClick={() => document.getElementById('logo')?.click()}
                        className="cursor-pointer py-2 px-3 w-full flex items-center justify-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                      />
                    </div>

                    <div className='flex justify-center'>
                      {logoImgUrl && (
                        <img
                          src={logoImgUrl}
                          alt="logo"
                          className='h-28 w-28 object-cover rounded-lg'
                        />
                      )}
                      {!logoImgUrl && (
                        <div className='h-28 w-28 object-cover rounded-lg bg-slate-200/90 border-2 border-dashed border-slate-300' />
                      )}
                    </div>
                  </li>

                  {/* <!-- Grid --> */}
                  <li className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label htmlFor="phone" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Phone</label>
                      <Field
                        type="text"
                        name="phone"
                        id="phone"
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Company Website</label>
                      <Field
                        type="text"
                        name="webPage"
                        id="website"
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                      />
                    </div>
                  </li>
                  {/* <!-- End Grid --> */}

                  <li>
                    <label htmlFor="description" className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Description</label>
                    <Field as="textarea" id="description" name="description" rows={4} className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" />
                  </li>
                </ul>
                {/* <!-- End Grid --> */}

                <div className="mt-6 grid">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 inline-flex justify-center items-center gap-x-2  font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  >
                    Create Organization
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
                      Organizations
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add organizations, edit and more.
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
                      Add organization
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

                    {organizationsData?.length > 0 ?
                      organizationsData?.map((organization) => (
                        <tr
                          onClick={() => navigate(`/organization/${organization.id}`)}
                          key={organization.id}
                          className="cursor-pointer bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                          <td className="h-px w-px whitespace-nowrap align-top">
                            <div className="block p-6">
                              <div className="flex items-center gap-x-3">
                                <img className="inline-block h-[2.375rem] w-[2.375rem] rounded-full" src={organization.mediaUrl || defaultImg} alt="Image Description" />
                                <div className="grow">
                                  <span className="w-52 overflow-hidden overflow-ellipsis whitespace-nowrap block text-sm font-semibold text-gray-800 dark:text-gray-200">{organization.name}</span>
                                  <span className="block text-sm text-gray-500">{organization.email}</span>
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
                              <span className="w-72 overflow-hidden overflow-ellipsis whitespace-nowrap block text-sm text-gray-500">{organization.description || 'Lorem Ipsum'}</span>
                            </div>
                          </td>

                          <td className="h-px w-px whitespace-nowrap align-top">
                            <div className="block p-6">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(organization.createdAt).toLocaleString()}</span>
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
                        <div>No data available yet!</div>
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
