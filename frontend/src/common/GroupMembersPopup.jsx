import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

const GroupMembersPopup = ({
  members = [],
  friends = [],
  groupId,
  onAddMember,
  onClose,
}) => {
  const popupRef = useRef(null);
  const [showFriendList, setShowFriendList] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showMembers, setMembers] = useState([]);

  // Sync members when prop updates
  useEffect(() => {
    setMembers(members);
  }, [members]);

  // Detect outside click to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ✅ Handle removing a member from group
  const handleRemoveMember = async (member) => {
    console.log("Removing member:", member.userId.name);
    try {
      setMembers((prev) => prev.filter((m) => m._id !== member._id));

      const res = await fetch("http://127.0.0.1:5000/group/removemember", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ memberId: member.userId._id, groupId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Member removed successfully");
      } else {
        alert("❌ Failed to remove member:", data.message);
      }
    } catch (error) {
      console.error("❌ Error while removing member:", error);
    }
  };

  const handleCheckboxChange = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = () => {
    const selectedFriendObjects = friends.filter((friend) =>
      selectedFriends.includes(friend._id)
    );

    console.log("👥 Submitting selected friends:", selectedFriendObjects);
    onAddMember(selectedFriendObjects);

    setMembers((prev) => [
      ...prev,
      ...selectedFriendObjects.map((friend) => ({
        userId: friend,
      })),
    ]);

    setSelectedFriends([]);
    setShowFriendList(false);
  };

  const toggleFriendList = () => {
    setShowFriendList((prev) => !prev);
    setSelectedFriends([]);
  };

  const filteredFriends = friends.filter(
    (friend) =>
      !showMembers.some((member) => member?.userId?._id === friend._id)
  );

  return (
    <div
      ref={popupRef}
      className="absolute top-12 right-0 bg-white shadow-xl rounded-xl p-4 w-80 z-50 border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        Group Members
      </h3>

      <ul className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-1">
        {showMembers.length > 0 ? (
          showMembers.map((member, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  {member?.userId?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span>{member?.userId?.name || "Unknown"}</span>
              </div>
              <button
                onClick={() => handleRemoveMember(member)}
                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                title="Remove member"
              >
                ✕
              </button>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500">No members found</p>
        )}
      </ul>

      <div className="relative">
        <button
          onClick={toggleFriendList}
          className="w-full flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} className="mr-2" />
          Add Member
        </button>

        {showFriendList && (
          <div className="mt-3 border rounded-lg bg-gray-50 p-2 max-h-48 overflow-y-auto">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <label
                  key={friend._id}
                  className="flex items-center space-x-2 text-sm text-gray-700 p-1 hover:bg-gray-100 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend._id)}
                    onChange={() => handleCheckboxChange(friend._id)}
                  />
                  <span>{friend.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 px-2">No friends available</p>
            )}
            {filteredFriends.length > 0 && (
              <button
                onClick={handleSubmit}
                className="mt-2 w-full bg-indigo-500 text-white text-sm py-1.5 rounded hover:bg-indigo-600 transition"
              >
                Submit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMembersPopup;
