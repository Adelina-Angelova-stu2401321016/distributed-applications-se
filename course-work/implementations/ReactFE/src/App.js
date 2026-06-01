import './App.css';
import Layout from "./components/Layout";
import Login from './components/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManageRoles from './components/Roles/ManageRoles';
import HomeScreen from "./components/HomeScreen";
import AllUsers from './components/Users/AllUsers';
import AddUser from './components/Users/AddUser';
import EditUser from './components/Users/EditUser';
import AllExhibits from './components/Exhibits/AllExhibits';
import AddExhibit from './components/Exhibits/AddExhibit';
import EditExhibit from './components/Exhibits/EditExhibit';
import AllRooms from './components/Rooms/AllRooms';
import AddRoom from './components/Rooms/AddRoom';
import EditRoom from './components/Rooms/EditRoom';
import ManageCollections from './components/Collections/ManageCollections';
import AllItems from './components/Items/AllItems';
import AddItem from './components/Items/AddItem';
import EditItem from './components/Items/EditItem';
import AllAttributes from './components/Attributes/AllAttributes';
import EditAttribute from './components/Attributes/EditAttribute';
import AllPartners from './components/Partners/AllPartners';
import ManagePartnerTypes from './components/Partners/ManagePartnerTypes';
import EditPartner from './components/Partners/EditPartner';
import AddPartner from './components/Partners/AddPartner';
import AllLoans from './components/Loans/AllLoans';
import AddLoan from './components/Loans/AddLoan';
import EditLoan from './components/Loans/EditLoan';
import AllStudies from './components/Studies/AllStudies';
import AddStudy from './components/Studies/AddStudy';
import EditStudy from './components/Studies/EditStudy';
import AllStudents from './components/Students/AllStudents';
import AddStudent from './components/Students/AddStudent';
import EditStudent from './components/Students/EditStudent';
import AllFunds from './components/Funds/AllFunds';
import AddFund from './components/Funds/AddFund';
import EditFund from './components/Funds/EditFunds';

function App() {
  const userRoleId = Number(localStorage.getItem("userRoleId"));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>

          <Route path="/home" element={<HomeScreen userRoleId={userRoleId} />} />
          <Route path="/roles/manage-roles" element={<ManageRoles />} />
          <Route path="/users/allusers" element={<AllUsers />} />
          <Route path="/users/add" element={<AddUser />} /> 
          <Route path="/users/edit/:id" element={<EditUser />} />
          <Route path="/exhibits/all" element={<AllExhibits />} />
          <Route path="/exhibits/add" element={<AddExhibit />} />
          <Route path="/exhibits/edit/:id" element={<EditExhibit />} />
          <Route path="/rooms/all" element={<AllRooms />} />
          <Route path="/rooms/add" element={<AddRoom />} />
          <Route path="/rooms/edit/:id" element={<EditRoom />} />
          <Route path="/collections/manage" element={<ManageCollections />} />
          <Route path="/items/all" element={<AllItems />} />
          <Route path="/items/add" element={<AddItem />} />
          <Route path="/items/edit/:id" element={<EditItem />} /> 
          <Route path="/attributes/all" element={<AllAttributes />} />
          <Route path="/attributes/edit/:id" element={<EditAttribute />} /> 
          <Route path="/partners/all" element={<AllPartners />} />
          <Route path="/partners/types" element={<ManagePartnerTypes />} />
          <Route path="/partners/edit/:id" element={<EditPartner />} /> 
          <Route path="/partners/add" element={<AddPartner />} /> 
             <Route path="/loans/all" element={<AllLoans />} />
          <Route path="/loans/edit/:id" element={<EditLoan />} /> 
          <Route path="/loans/add" element={<AddLoan />} /> 
             <Route path="/studies/all" element={<AllStudies />} />
          <Route path="/studies/edit/:id" element={<EditStudy />} /> 
          <Route path="/studies/add" element={<AddStudy />} /> 
            <Route path="/students/all" element={<AllStudents />} />
          <Route path="/students/edit/:id" element={<EditStudent />} /> 
          <Route path="/students/add" element={<AddStudent />} /> 
            <Route path="/funds/all" element={<AllFunds />} />
          <Route path="/funds/edit/:id" element={<EditFund />} /> 
          <Route path="/funds/add" element={<AddFund />} /> 
          
          

        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
