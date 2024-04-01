import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import ModalForm from "../Components/ModalForm";
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_AREAS, QUERY_OPTIONS } from "../utils/queries";
import { ADD_OPTION, DELETE_OPTION, EDIT_OPTION } from "../utils/mutations";
import { UPDATE_ACCOUNT_AREAS, UPDATE_ACCOUNT_OPTIONS } from "../utils/actions";
import auth from "../utils/auth";
import Login from "./Login";
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

export default function GroceryOptionView() {
    const [state, dispatch] = useStoreContext();
    const [editOption, setEditOption] = React.useState(false);    
    const [addOption, setAddOption] = React.useState(false);
    const [organizedOptions, setOrganizedOptions] = React.useState([]);
    const [addNewOption] = useMutation(ADD_OPTION);
    const [deleteOption] = useMutation(DELETE_OPTION);
    const [editOptionPatch] = useMutation(EDIT_OPTION);
    const [optionToEditID, setOptionToEditID] = React.useState();
    const { data, loading, error } = useQuery(QUERY_OPTIONS, {
        variables: { accountId: localStorage.getItem('accountId')}
    });
    const { data: areaData, loading: areaLoading, error: areaError } = useQuery(QUERY_AREAS, {
        variables: { accountId: localStorage.getItem('accountId')}
    });

    
    const handleEditOption = (e) => {
        const optionToEdit = state?.accountOptions?.find((area) => area._id === e.target.id)
        setOptionToEditID(() => optionToEdit._id)
        setOptionForm([
            {
                title: "Option Name",
                type: "text",
                name: "name",
                value: optionToEdit.name,
            },
            {
                title: "Area",
                type: "dropdown",
                items: state?.areas?.map((a) => { return {value: a._id, name: a.name }}),
                name: "area",
                value: !!optionToEdit?.areaId ? optionToEdit.areaId : "",
            },
        ])
        setEditOption(true);
    }

    const handleOpenModal = () => {
        setOptionForm([
            {
                title: "Option Name",
                type: "text",
                name: "name",
                value: ""
            },
            {
                title: "Area",
                type: "dropdown",
                items: state?.areas?.map((a) => { return {value: a._id, name: a.name }}),
                name: "area",
                value: "",
            },
        ])
        setAddOption(true)
    };

    const [optionForm, setOptionForm] = React.useState([
        {
            title: "Area Name",
            type: "text",
            name: "name",
            value: ""
        },
    ]);

    const handleCloseModal = (e) => {
        setAddOption(() => false);
        setEditOption(() => false);
    };

    const handleDeleteOption = async (e) => {
        const removedOption = await deleteOption({
            variables: { _id: e.target.id}
        })
        if(!!removedOption.data.deleteOption) {
            dispatch({
                type: UPDATE_ACCOUNT_OPTIONS,
                options: state.accountOptions.filter((a) => a._id !== e.target.id)
            });
        };
    };

    const handlePatchOption = async () => {
        const editedOption = await editOptionPatch({
            variables: { _id: optionToEditID, name: optionForm[0].value, areaId: optionForm[1].value }
        });
        if(!!editedOption.data.editOption) {
            const newOptions = state.accountOptions.filter((a) => a._id !== optionToEditID);
            dispatch({
                type: UPDATE_ACCOUNT_OPTIONS,
                options: [
                    ...newOptions,
                    editedOption.data.editOption
                ]
            });
            setEditOption(false);
        }
    };

    function compare( a, b ) {
        if ( a.name < b.name ){
          return -1;
        }
        if ( a.name > b.name ){
          return 1;
        }
        return 0;
      };

    const handleAddOption = async () => {
        const newOption = await addNewOption({
            variables: { accountId: localStorage.getItem('accountId'), name: optionForm[0].value, areaId: optionForm[1].value }
        })
        if(!!newOption.data.addOption) {
            dispatch({
                type: UPDATE_ACCOUNT_OPTIONS,
                options: [
                    ...state?.accountOptions,
                    newOption.data.addOption
                ]
            });
            setAddOption(false);
        }
    };

    React.useEffect(() => {
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT_OPTIONS,
                options: data.getOptions
            });
        }
    }, [data]);

    React.useEffect(() => {
        if(!!areaData) {
            dispatch({
                type: UPDATE_ACCOUNT_AREAS,
                areas: areaData.getAreas
            });
        }
    }, [areaData]);

    React.useEffect(() => {
        if(!!state?.accountOptions) {
            setOrganizedOptions(() => state.accountOptions.sort(compare))
        }
    }, [state?.accountOptions])

    if(auth.loggedIn()) {

        return (
            <>
                {editOption && (
                    <ModalForm
                    title={'Edit Option'}
                    fields={optionForm}
                    editFields={setOptionForm}
                    submitFunction={handlePatchOption}
                    closeDialog={handleCloseModal}
                />
                )}
                {addOption && (
                    <ModalForm
                        title={'Add Option'}
                        fields={optionForm}
                        editFields={setOptionForm}
                        submitFunction={handleAddOption}
                        closeDialog={handleCloseModal}
                    />
                )}
                <h3>Grocery Options</h3>
                {state?.accountOptions?.length === 0 && (
                    <div>Add Your First Option</div>
                )}
                <div>
                    <Button variant="primary" className="green-color" onClick={handleOpenModal}>Add Option</Button>
                </div>
                {!!state?.accountOptions?.length && (organizedOptions?.map((ao) => (
                            <div className="card m-3" key={ao._id} id={ao._id}>
                                <div id={ao._id} className="d-flex flex-wrap justify-content-between mt-1 mx-3">
                                    <h4 id={ao._id}>{ao.name}</h4>
                                    <div>
                                        <Dropdown as={NavItem} className='align-items-end'>
                                            <Dropdown.Toggle as={NavLink}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                </svg>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='drop-down'>
                                                <Dropdown.Item id={ao._id} onClick={handleEditOption}>Edit</Dropdown.Item>
                                                <Dropdown.Item id={ao._id} onClick={handleDeleteOption}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div className="d-flex ps-3 justify-content-start">{state?.areas?.find((a) => a._id === ao.areaId)?.name}</div>
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