'use client';

import React, { useState } from 'react';

export default function AdvancedCreateGameForm() {
    // State to track whether the accordion is open or closed
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    // Function to toggle the accordion
    const toggleAccordion = () => {
        console.log(!isAccordionOpen);
        setIsAccordionOpen(prevState => !prevState);
    };

    return (
        <div id="accordion-flush">
            <h2 id="accordion-flush-heading-1">
                <button
                    type="button"
                    onClick={toggleAccordion} // Attach onClick event to toggleAccordion function
                    className="flex items-center justify-between w-full py-5 font-medium rtl:text-right text-gray-500 gap-3"
                    data-accordion-target="#accordion-flush-body-1"
                    aria-expanded={isAccordionOpen ? "true" : "false"} // Set aria-expanded based on state
                    aria-controls="accordion-flush-body-1"
                >
                    <span>Show advanced options</span>
                    <svg
                        data-accordion-icon
                        className={`w-3 h-3 transform rotate-${isAccordionOpen ? '180' : '0'} shrink-0`} // Toggle rotation based on state
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                    </svg>
                </button>
            </h2>
            {/* Use conditional rendering based on the state to show or hide content */}
            <div id="accordion-flush-body-1" className={"py-1 " + (isAccordionOpen ? "" : "hidden")}>
                <div className="flex mb-5">

                    <div className="flex items-center h-5">
                        <input id="enableChat" name="enableChat" aria-describedby="enableChat-text" type="checkbox" value="checked" defaultChecked={true} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                    </div>
                    <div className="ms-2 text-sm">
                        <label htmlFor="enableChat" className="font-medium text-gray-900">Enable Chat</label>
                        <p id="enableChat-text" className="text-xs font-normal text-gray-500">Allows players to use in-game realtime chat</p>
                    </div>
                </div>

                {/* <div className="mb-5">
                        <label htmlFor="decksUsed" className="block mb-2 text-sm font-medium text-gray-900">Decks used per shoe</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            defaultValue={6}
                            id="decksUsed"
                            name="decksUsed"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter number of dekcs"
                            required
                        />
                    </div> */}

            </div>
        </div>
    );
}
