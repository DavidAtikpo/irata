// app/on-screen-questions/page.tsx
import React from "react";

export default function OnScreenQuestions() {
  return (
    <main className="p-8 max-w-6xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6">
        4. ON-SCREEN QUESTIONS AND DISCUSSION POINTS
      </h1>
      <p className="mb-6">
        Below are all the questions as seen on-screen, together with discussion
        points for the presenter to cover with the audience.
      </p>

      {/* Helper for table */}
      {/*
        J'utilise des tableaux identiques pour toutes les sections.
      */}
      {/*** Question 1 ***/}
      <Section
        title="Question 1. Use of a mobile telephone whilst driving"
        rows={[
          {
            q: "1.1",
            text: "What is wrong in this scene?",
            discuss:
              "Technician driving whilst on the phone appears to be distracted with other issues. The technician is flustered as he is aware that he is arriving late.",
          },
          {
            q: "1.2",
            text: "Is the technician displaying appropriate safety behaviour?",
            discuss:
              "No. In many countries using a phone whilst driving is illegal.",
          },
        ]}
      />

      {/*** Question 2 ***/}
      <Section
        title="Question 2. Colleague arriving late"
        rows={[
          {
            q: "2.1",
            text: "How should the supervisor behave if a technician arrives late?",
            discuss:
              "Knowing the technician is late and looking flustered, the supervisor should assess whether it is appropriate to start work immediately, or to take a short break.",
          },
        ]}
      />

      {/*** Question 3 ***/}
      <Section
        title="Question 3. Pre-job planning"
        rows={[
          {
            q: "3.1",
            text: "Is the risk assessment, method statement and rescue plan being taken seriously?",
            discuss:
              "No. Insufficient time has been made to read and understand it. No questions have been asked and both parties are going into the bare minimum to get on with the job.",
          },
          {
            q: "3.2",
            text: "Does the technician feel able to challenge the supervisor if needed?",
            discuss:
              "It is quite clear that the supervisor just wants to get the job done his way and leave. This attitude does not encourage the technician to engage with the pre-job planning process. Note that arriving late will not encourage the technician to question the supervisor.",
          },
          {
            q: "3.3",
            text: "Are the technicians working together as a team?",
            discuss:
              "No, the technician is following instruction from the supervisor and shows no inclination to challenge or question him. They are therefore not looking after each other's best interests.",
          },
        ]}
      />

      {/*** Question 4 ***/}
      <Section
        title="Question 4. Edge management"
        rows={[
          {
            q: "4.1",
            text: "Have all edges been risk assessed and adequately managed?",
            discuss:
              "No. There needs to be a full understanding of the hazard in order for appropriate control measures to be put in place. This information should be in the risk assessment, and should have been pre-planned (at the office). The team are not accounting for edges within their workplace, not thinking of how to rig their ropes to avoid them, and are not giving all hazards enough thought or respect.",
          },
          {
            q: "4.2",
            text: "Has the team chosen the correct rope protection?",
            discuss:
              "No. Evaluation of more substantial rope protection should be considered.",
          },
          {
            q: "4.3",
            text: "Has the risk of the grinder cutting the rope been considered?",
            discuss:
              "No. It has not been mentioned by either team member.",
          },
          {
            q: "4.4",
            text: "What other work methods would be suitable?",
            discuss: `For example:
- Removing the sharp edge by moving the cable tray
- Working from steel strops to avoid the need for ropes
- Rigging the ropes away from the sharp edge
- Using a protective sleeve to protect against grinder`,
          },
        ]}
      />

      {/*** Question 5 ***/}
      <Section
        title="Question 5. Mobile phones on the worksite"
        rows={[
          {
            q: "5.1",
            text: "Is the technician concentrating on the job or is his attention elsewhere?",
            discuss:
              "No. He is thinking about his wife ringing. Phones have their uses at work for emergencies, or team communications. A mobile phone could also be a potential dropped object.",
          },
        ]}
      />

      {/*** Question 6 ***/}
      <Section
        title="Question 6. Sharp edges"
        rows={[
          {
            q: "6.1",
            text: "Are the ropes rigged appropriately?",
            discuss:
              "Now that a sharp edge has been found that was not recognised in the pre-job planning, the team should stop and reconsider their rigging, and edge management systems.",
          },
          {
            q: "6.2",
            text: "Do canvas rope protectors protect against sharp edges?",
            discuss:
              "No. They are not designed to protect against sharp edges. A far more substantial device would be needed to protect ropes from a sharp metal edge. Discuss what you could do with your audience.",
          },
          {
            q: "6.3",
            text: "Should the team have stopped and reconsidered the sharp edge?",
            discuss:
              "Yes. A sharp edge should be a clear 'stop the job' trigger. The team should re-assess whether the risk assessment and method statements are still appropriate.",
          },
          {
            q: "6.4",
            text: "Can you think of an example where you have not correctly managed and protected your ropes?",
            discuss:
              "Request the audience provides examples which could be used as a learning aid for others.",
          },
        ]}
      />

      {/*** Question 7 ***/}
      <Section
        title="Question 7. Testing the grinder"
        rows={[
          {
            q: "7.1",
            text: "What is wrong in this scene?",
            discuss:
              "The technician tested the grinder by his ropes and could easily have cut through them.",
          },
          {
            q: "7.2",
            text: "When should the technician have tested the grinder safety mechanism?",
            discuss:
              "A technician should familiarise themselves with tools and equipment before starting the job.",
          },
        ]}
      />

      {/*** Question 8 ***/}
      <Section
        title="Question 8. Use of goggles"
        rows={[
          {
            q: "8.1",
            text: "Are the goggles fit for purpose?",
            discuss:
              "No. Discuss the use of goggles in these circumstances as in wet conditions most eye protection will steam up. Would a face shield or visor be more appropriate?",
          },
        ]}
      />

      {/*** Question 9 ***/}
      <Section
        title="Question 9. Supervision"
        rows={[
          {
            q: "9.1",
            text: "Should the supervisor be paying more attention to the work in progress?",
            discuss:
              "Yes, but poor planning, rushing, lack of discussion between the team, and poor supervision have been issues throughout. These should all have been identified earlier and perhaps the supervisor is unsuitable to safety on the job.",
          },
        ]}
      />
    </main>
  );
}

// Composant réutilisable pour chaque section
function Section({
  title,
  rows,
}: {
  title: string;
  rows: { q: string; text: string; discuss: string }[];
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <table className="w-full border border-gray-400 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 p-2">Question</th>
            <th className="border border-gray-400 p-2">On-screen text</th>
            <th className="border border-gray-400 p-2">Discuss</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              <td className="border p-2">{row.q}</td>
              <td className="border p-2 whitespace-pre-line">{row.text}</td>
              <td className="border p-2 whitespace-pre-line">{row.discuss}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
