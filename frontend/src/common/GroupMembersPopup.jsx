// components/GroupMembersPopup.jsx
import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";

const GroupMembersPopup = ({ members, onAddMember, onClose }) => {
  const popupRef = useRef(null);

  // Detect outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute top-12 right-0 bg-white shadow-xl rounded-xl p-4 w-72 z-50 border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        Group Members
      </h3>

      <ul className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1">
        {members.length > 0 ? (
          members.map((member, index) => (
            <li
              key={index}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
            >
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                {member.userId.name[0]}
              </div>
              <span>{member.userId.name}</span>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500">No members found</p>
        )}
      </ul>

      <button
        onClick={onAddMember}
        className="w-full mt-2 flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
      >
        <Plus size={16} className="mr-2" />
        Add Member
      </button>
    </div>
  );
};

export default GroupMembersPopup;
