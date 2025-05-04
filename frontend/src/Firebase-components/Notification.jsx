import FriendRequestsNotification from "../components/FriendRequestsNotification.jsx";

export default function NotificationsPage({ currentUser }) {
  return (
    <div>
      <FriendRequestsNotification currentUser={currentUser} />
    </div>
  );
}
