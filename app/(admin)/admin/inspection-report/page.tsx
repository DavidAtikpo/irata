'use client';

import React from 'react';

export default function InspectionReportPage() {
  return (
    <div className="p-6 print:p-2 text-black font-sans bg-white">
      <div className="max-w-4xl mx-auto bg-white shadow-md print:shadow-none">
        {/* Header */}
        <div className="border-2 border-blue-600 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-blue-600 p-2 text-xs">
              <p><strong>Doc. No.:</strong> HS019ENG</p>
              <p><strong>Date of Issue:</strong> 07/06/16</p>
              <p><strong>Issue No.:</strong> 001</p>
              <p><strong>Page:</strong> 1 of 1</p>
            </div>
            <div className="col-span-2 border border-blue-600 p-4 flex items-center justify-center">
              <h1 className="text-lg font-bold text-center uppercase">Level 3 Equipment Inspection Report</h1>
            </div>
            <div className="border border-blue-600 p-2 text-xs"></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="border-2 border-gray-300 p-4 my-4 text-sm text-center font-bold">
          All shaded boxes must be complete before handing back to your assessor.
        </div>

        {/* Form Fields */}
        <div className="space-y-2 mb-4 text-xs">
          {[
            ['Date of inspection:', 'Make of item:'],
            ['Technician name:', 'Model of item:'],
            ['Technician IRATA No.:', 'Item ID number:'],
          ].map((row, idx) => (
            <div key={idx} className="grid grid-cols-6 gap-2">
              {row.map((label, i) => (
                <React.Fragment key={i}>
                  <div className="col-span-1 p-2 border border-gray-300">{label}</div>
                  <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
                    <input className="w-full bg-transparent outline-none text-xs" type="text" />
                  </div>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>

        {/* Guidance */}
        <div className="border-2 border-gray-300 p-4 my-4 text-sm">
          <p className="mb-2">For guidance when completing this document, technicians should refer to the following:</p>
          <ul className="list-disc list-inside mb-2">
            <li>IRATA ICOP (Annex H includes equipment inspection checklists);</li>
            <li>IRATA Safety bulletins;</li>
            <li>Equipment manufacturer’s user instructions;</li>
            <li>Additional manuals/ course hand-outs supplied by your IRATA training company.</li>
          </ul>
          <p className="font-bold text-right">A: Accept / R: Reject</p>
        </div>

        {/* Inspection Table */}
        <div className="border-2 border-gray-300 text-xs">
          <div className="grid grid-cols-6 font-bold bg-gray-100 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Conformance and History</div>
            <div className="col-span-2 p-2 border-r border-gray-300">Comment</div>
            <div className="p-2 text-center">A / R</div>
          </div>
          {[
            'Standards to which item conforms',
            'Suitability of item',
            'Age of item',
            'History of item',
            'Visual & Tactile check of safety components',
            'Condition of the Metal parts: (deformation, sharp edges, wear, corrosion, other damage)',
            'Condition of Textile parts (load bearing webbing and stitching): (cuts, abrasions, burns, chemical contamination, other damage)',
            'Condition of Plastic parts (deformation, wear, cracks)',
            'Operational / Function check',
            'Any moving parts function correctly',
            'Operational check of any functions',
            'Compatibility of multiple parts',
          ].map((label, index) => (
            <div key={index} className="grid grid-cols-6 border-b border-gray-300">
              <div className="col-span-3 p-2 border-r border-gray-300">{label}</div>
              <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
                <input className="w-full bg-transparent outline-none" type="text" />
              </div>
              <div className="p-2 text-center bg-blue-100">
                <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Overall Comments */}
        <div className="border-2 border-gray-300 p-4 my-4 bg-blue-100 text-xs">
          <p className="font-bold mb-2">Overall comments / action to be taken:</p>
          <textarea rows={3} className="w-full bg-transparent outline-none" />
        </div>

        {/* Verdict */}
        <div className="border-2 border-gray-300 p-4 my-4 text-xs">
          <p className="font-bold mb-2">Overall verdict by technician (tick the relevant box below):</p>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              This product is fit to remain in service (Pass)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              This product is unfit to remain in service (Fail)
            </label>
          </div>
        </div>

        {/* Assessor Section */}
        <div className="border-2 border-gray-300 p-4 my-4 text-xs">
          <p className="mb-2">For assessor use only:</p>
          <p className="font-bold mb-2">Verdict by assessor (P = Pass, Dis = Minor discrepancy, F = Fail):</p>
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Candidate <u>has</u> correctly identified condition and provided appropriate verdict
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Candidate <u>has not</u> provided correct verdict for product
            </label>
          </div>
          <div>
            <p className="font-bold mb-1">Assessor comments:</p>
            <textarea rows={3} className="w-full border border-gray-300 p-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
