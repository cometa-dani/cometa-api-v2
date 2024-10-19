import React, { FC } from "react";
import { animated, useTransition } from '@react-spring/web';
import { createPortal } from "react-dom";


interface ModalProps {
  isOpen: boolean;
  handleTransition: () => void;
  children: React.ReactNode;
  header?: string | React.ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, handleTransition, header, children }) => {

  const transition = useTransition(isOpen, {
    from: {
      y: '120%',
      opacity: 0.4,
    },
    enter: {
      y: '0%',
      opacity: 1,
    },
    leave: {
      y: '120%',
      opacity: 0,
    },
    config: {
      tension: 260,
      mass: 1.40
    }
  });

  const AnimatedModal: FC = () => transition((style, isOpen) => (
    isOpen && (
      <animated.div style={{ opacity: style.opacity }} className="bg-slate-700/60 w-full h-full fixed top-0 start-0 z-[60] overflow-x-hidden overflow-y-hidden items-center flex">
        <animated.div style={style} className="mt-0 sm:max-w-3xl sm:w-full m-3 sm:mx-auto">
          <div className="max-h-[570px] overflow-hidden flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700/[.7]">

            {/* header */}
            <div className="flex justify-between items-center py-3 px-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {header || 'header'}
              </h3>
              <button onClick={handleTransition} type="button" className="flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-lg border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-transparent dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" data-hs-overlay="#hs-bg-gray-on-hover-cards">
                <span className="sr-only">Close</span>
                <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            {/* header */}

            {/* children content */}
            <div className="px-8 py-4 overflow-y-auto" >
              <div className="sm:divide-y divide-gray-200 dark:divide-gray-700">
                {children}
              </div>
            </div>
            {/* children content */}

            {/* footer */}
            <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-gray-700">
              <a className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="../docs/index.html">
                Download App
                <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </a>
            </div>
            {/* footer */}
          </div>
        </animated.div>
      </animated.div>
    )
  ));

  return (
    createPortal(<AnimatedModal />, document.querySelector('#modal')!)
  );
};
