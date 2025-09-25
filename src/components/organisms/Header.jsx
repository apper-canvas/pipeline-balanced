import React, { useContext } from "react";
import { useSelector } from "react-redux";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import { AuthContext } from "../../App";
const Header = ({ onMenuClick, searchValue, onSearchChange }) => {
const { user } = useSelector((state) => state.user);
  const { logout } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-2"
          >
            <ApperIcon name="Menu" className="h-6 w-6" />
          </Button>
          
          <div className="hidden md:block">
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Search contacts, deals, tasks..."
              className="w-80"
            />
          </div>
        </div>

<div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <ApperIcon name="Bell" className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-error rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="h-4 w-4 text-white" />
            </div>
            {user && (
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-gray-900"
            >
              <ApperIcon name="LogOut" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;