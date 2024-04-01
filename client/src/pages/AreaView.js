import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import ModalForm from "../Components/ModalForm";
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_ACCOUNT_LISTS, QUERY_AREAS } from "../utils/queries";
import { ADD_AREA, DELETE_AREA, DELETE_LIST, EDIT_AREA, EDIT_LIST } from "../utils/mutations";
import { UPDATE_ACCOUNT_AREAS, UPDATE_ACCOUNT_LISTS } from "../utils/actions";
import auth from "../utils/auth";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

export default function AreaView() {
    const navigate = useNavigate();
    const [state, dispatch] = useStoreContext();
    const [editArea, setEditArea] = React.useState(false);    
    const [addArea, setAddArea] = React.useState(false);
    const [addNewArea] = useMutation(ADD_AREA);
    // const [billAdded, setBillAdded] = React.useState();
    const [deleteArea] = useMutation(DELETE_AREA);
    const [editAreaPatch] = useMutation(EDIT_AREA);
    const [areaToEditID, setAreaToEditID] = React.useState();
    const [billRemoved, setBillRemoved] = React.useState();
    const [ListEdited, setListEdited] = React.useState();
    const [editListId, setEditListId] = React.useState();
    const { data, loading, error } = useQuery(QUERY_AREAS, {
        variables: { accountId: localStorage.getItem('accountId')}
    });
    
    const handleEditArea = (e) => {
        const areaToEdit = state?.areas?.find((area) => area._id === e.target.id)
        setAreaToEditID(() => areaToEdit._id)
        setAreaForm([
            {
                title: "Area Name",
                type: "text",
                name: "name",
                value: areaToEdit.name,
                defaultValue: areaToEdit.name
            },
        ])
        setEditArea(true);
    }

    const handleOpenModal = () => {
        setAreaForm([
            {
                title: "Area Name",
                type: "text",
                name: "name",
                value: ""
            },
        ])
        setAddArea(true)
    };

    const [areaForm, setAreaForm] = React.useState([
        {
            title: "Area Name",
            type: "text",
            name: "name",
            value: ""
        },
    ]);

    const handleCloseModal = (e) => {
        setAddArea(() => false);
        setEditArea(() => false);
    };

    const handleDeleteArea = async (e) => {
        const removedArea = await deleteArea({
            variables: { _id: e.target.id}
        })
        if(!!removedArea.data.deleteArea) {
            dispatch({
                type: UPDATE_ACCOUNT_AREAS,
                areas: state.areas.filter((a) => a._id !== e.target.id)
            });
        };
    };

    const handlePatchArea = async () => {
        const editedArea = await editAreaPatch({
            variables: { _id: areaToEditID, name: areaForm[0].value }
        });
        if(!!editedArea.data.editArea) {
            const newAreas = state.areas.filter((a) => a._id !== areaToEditID);
            dispatch({
                type: UPDATE_ACCOUNT_AREAS,
                areas: [
                    ...newAreas,
                    editedArea.data.editArea
                ]
            });
            setEditArea(false);
        }
    }

    const handleAddArea = async () => {
        const newArea = await addNewArea({
            variables: { accountId: localStorage.getItem('accountId'), name: areaForm[0].value }
        })
        if(!!newArea.data.addArea) {
            dispatch({
                type: UPDATE_ACCOUNT_AREAS,
                areas: [
                    ...state?.areas,
                    newArea.data.addArea
                ]
            });
            setAddArea(false);
        }
    };

    React.useEffect(() => {
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT_AREAS,
                areas: data.getAreas
            });
        }
    }, [data]);

    if(auth.loggedIn()) {

        return (
            <>
                {editArea && (
                    <ModalForm
                    title={'Edit Area'}
                    fields={areaForm}
                    editFields={setAreaForm}
                    submitFunction={handlePatchArea}
                    closeDialog={handleCloseModal}
                />
                )}
                {addArea && (
                    <ModalForm
                        title={'Add Area'}
                        fields={areaForm}
                        editFields={setAreaForm}
                        submitFunction={handleAddArea}
                        closeDialog={handleCloseModal}
                    />
                )}
                <h3>Areas</h3>
                {state?.areas?.length === 0 && (
                    <div>Add Your First Area</div>
                )}
                <div>
                    <Button variant="primary" className="green-color" onClick={handleOpenModal}>Add Area</Button>
                </div>
                {!!state?.areas?.length && (state?.areas?.map((area) => (
                            <div className="card m-3" key={area._id} id={area._id}>
                                <div id={area._id} className="d-flex flex-wrap justify-content-between mt-1 mx-3">
                                    <h4 id={area._id}>{area.name}</h4>
                                    <div>
                                        <Dropdown as={NavItem} className='align-items-end'>
                                            <Dropdown.Toggle as={NavLink}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                </svg>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='drop-down'>
                                                <Dropdown.Item id={area._id} onClick={handleEditArea}>Edit</Dropdown.Item>
                                                <Dropdown.Item id={area._id} onClick={handleDeleteArea}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        )))}
            </>
        )
    } else {
        return (
            <Login />
        )
    }
    

};