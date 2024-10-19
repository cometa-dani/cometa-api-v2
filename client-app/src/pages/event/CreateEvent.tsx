import { FC } from 'react';


export const CreateEvent: FC = () => {
  return (
    <section className="h-screen flex items-center justify-center text-slate-600">
      <form className="flex flex-col gap-4">

        <h3>Hello World</h3>
        <div>
          <label className="font-bold" htmlFor="eventName">
            Event Name:
          </label>
          <input
            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            type="text"
            id="eventName"
            name="eventName"
            required
          />
        </div>

        <div>
          <label className="font-bold" htmlFor="eventPhoto">
            Event Photo:
          </label>
          <input
            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            type="file"
            id="eventPhoto"
            name="eventPhoto"
            required
          />
        </div>

        <div>
          <label className="font-bold" htmlFor="eventDescription">Event Description: </label>
          <textarea
            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            id="eventDescription"
            name="eventDescription"
            rows={4}
            required
          ></textarea>
        </div>

        <div>
          <label className="font-bold" htmlFor="eventDate">Event Date:</label>
          <input
            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            type="datetime-local"
            id="eventDate"
            name="eventDate"
            required
          />
        </div>

        <div>
          <label className="font-bold" htmlFor="eventLocation">Event Location:</label>
          <select
            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            id="eventLocation"
            name="eventLocation"
            required
          >
            <option value="">Select a Location</option>
            <option value="Lusail Stadium">Lusail Stadium</option>
            <option value="Abdullah Bin Khalifa Stadium">
              Abdullah Bin Khalifa Stadium
            </option>
            <option value="Al Thumama Stadium">Al Thumama Stadium</option>

            <option value="Al Bayt Stadium">Al Bayt Stadium</option>

            <option value="Khalifa International Stadium ">
              Khalifa International Stadium
            </option>

            <option value="Ahmad Bin Ali Stadium">Ahmad Bin Ali Stadium</option>
          </select>
        </div>

        <div>
          <button
            className="w-full bg-indigo-500 text-slate-50 font-bold uppercase px-4 py-2 rounded-md"
            type="submit"
          >
            Create Event
          </button>
        </div>
      </form>
    </section>
  );
};
