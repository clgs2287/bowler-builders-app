import { createRoot } from "react-dom/client";
import ReservationAverageReview from "../../src/ReservationAverageReview";

const rows = new Map();
const client = {
  from(name) {
    if (name !== "reservation_average_verifications") throw new Error("Unexpected local review table.");
    return {
      select: () => ({ eq: async () => ({ data: [...rows.values()] }) }),
      upsert: (record) => ({ select: () => ({ single: async () => {
        rows.set(record.reservation_id, record);
        return { data: record };
      } }) }),
      delete: () => ({ eq: (_, id) => ({ select: () => ({ single: async () => {
        rows.delete(id);
        return { data: { reservation_id: id } };
      } }) }) }),
    };
  },
};

const sameName = (id, group) => ({
  id, reservationGroupId: group, reservationGroupSize: 2, reservationMemberIndex: 0,
  confirmationNumber: group, name: "SYN Duplicate Name",
});
const reservations = [
  sameName("a1", "01"),
  { ...sameName("a2", "01"), reservationMemberIndex: 1, name: "SYN Partner A" },
  sameName("b1", "02"),
  { ...sameName("b2", "02"), reservationMemberIndex: 1, name: "SYN Partner B" },
];
const root = document.createElement("div");
root.id = "phase3-average-fixture";
document.body.append(root);
createRoot(root).render(<ReservationAverageReview adminId="synthetic-local-admin" tournamentKey="synthetic-local-event"
  info={{ tournamentStyle: "doubles", useHandicapScores: true, maxCombinedTeamAverage: 340 }}
  client={client} reservations={reservations} />);
