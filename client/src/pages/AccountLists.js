import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import ModalForm from "../Components/ModalForm";
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_ACCOUNT_LISTS, QUERY_AREAS } from "../utils/queries";
import { ADD_LIST, DELETE_LIST, EDIT_LIST } from "../utils/mutations";
import { UPDATE_ACCOUNT_AREAS, UPDATE_ACCOUNT_LISTS } from "../utils/actions";
import auth from "../utils/auth";
import Login from "./Login";
import { replaceItemInArray } from '../utils/helpers';
import { useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

export default function ListsView() {
    const navigate = useNavigate();
    const [state, dispatch] = useStoreContext();
    const [editList, setEditList] = React.useState(false);    
    const [addList, setAddList] = React.useState(false);
    const [addNewList] = useMutation(ADD_LIST);
    // const [billAdded, setBillAdded] = React.useState();
    const [deleteList] = useMutation(DELETE_LIST);
    const [editListPatch] = useMutation(EDIT_LIST);
    const [billRemoved, setBillRemoved] = React.useState();
    const [ListEdited, setListEdited] = React.useState();
    const [editListId, setEditListId] = React.useState();
    const { data, loading, error } = useQuery(QUERY_ACCOUNT_LISTS, {
        variables: { accountId: localStorage.getItem('accountId')}
    });
    const { data: areaData, loading: areaLoading, error: areaError} = useQuery(
        QUERY_AREAS, {
            variables: { accountId: localStorage.getItem('accountId')}
        }
    )
    
    const handleEditList = (e) => {
        const listToEdit = state?.accountLists?.filter((list) => list._id === e.target.id)
        // setEditBillId(() => billToEdit[0]._id)
        setListForm([
            {
                title: "List Name",
                type: "text",
                name: "name",
                value: listToEdit[0].name,
                defaultValue: listToEdit[0].name
            },
            // {
            //     title: "Areas",
            //     type: "dropdown",
            //     items: (areaLoading ? [{ value: "No options", name: null }] : state.accountAreas),
            //     name: 'area',
            //     value: listToEdit[0].areaId
            // }
        ])
        setEditList(true);
    }

    const handleOpenModal = () => {
        setListForm([
            {
                title: "List Name",
                type: "text",
                name: "name",
                value: ""
            },
            // {
            //     title: "Areas",
            //     type: "dropdown",
            //     items: (areaLoading ? [{ value: "No options", name: null }] : state.accountAreas),
            //     name: 'area',
            //     value: ""
            // }
        ])
        setAddList(true)
    };

    const [listForm, setListForm] = React.useState([
        {
            title: "List Name",
            type: "text",
            name: "name",
            value: ""
        },
    ]);

    const handleCloseModal = (e) => {
        setAddList(() => false);
        setEditList(() => false);
    };

    const handleViewList = (e) => {
        if(!!e.target.id) {
            navigate(`/GroceryItems/${e.target.id}`);
        }
    }

    const handleDeleteList = async (e) => {
        const data = await deleteList({
            variables: { _id: `${e.target.id}` }
        })
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT_LISTS,
                lists: state.accountLists.filter((al) => al._id !== e.target.id)
            });
        }
    };

    const handlePatchList = async () => {
        const editedList = await editListPatch({
            variables: { _id: editListId, name: listForm[0].value, date: listForm[1].value }
        });
        if(!!editedList) {
            dispatch({
                type: UPDATE_ACCOUNT_LISTS,
                lists: replaceItemInArray(state.accountLists, state.accountLists.find((al) => al._id === editListId), editedList.data.editList)
            });
            setEditList(false)
        }
    }

    const handleAddList = async () => {
        const data = await addNewList({
            variables: { accountId: localStorage.getItem('accountId'), name: listForm[0].value }
        })
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT_LISTS,
                lists: [...state.accountLists, data.data.addList]

            });
            setAddList(false);
        }
    };

    React.useEffect(() => {
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT_LISTS,
                lists: data.getLists
            });
        }
    }, [data]);

    if(auth.loggedIn()) {

        return (
            <>
                {editList && (
                    <ModalForm
                    title={'Edit List'}
                    fields={listForm}
                    editFields={setListForm}
                    submitFunction={handlePatchList}
                    closeDialog={handleCloseModal}
                />
                )}
                {addList && (
                    <ModalForm
                        title={'Add List'}
                        fields={listForm}
                        editFields={setListForm}
                        submitFunction={handleAddList}
                        closeDialog={handleCloseModal}
                    />
                )}
                <h3>Lists</h3>
                {state?.accountLists?.length === 0 && (
                    <div>Add Your First List</div>
                )}
                <div>
                    <Button variant="primary" className="green-color" onClick={handleOpenModal}>Add List</Button>
                </div>
                {!!state?.accountLists?.length && (state?.accountLists?.map((list) => (
                            <div className="card m-3" key={list._id} id={list._id}>
                                <div id={list._id} className="d-flex flex-wrap justify-content-between mt-1 mx-3">
                                    <h4 id={list._id}>{list.name}</h4>
                                    <div>
                                        <Dropdown as={NavItem} className='align-items-end'>
                                            <Dropdown.Toggle as={NavLink}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                </svg>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='drop-down'>
                                                <Dropdown.Item id={list._id} onClick={handleEditList}>Edit</Dropdown.Item>
                                                <Dropdown.Item id={list._id} onClick={handleDeleteList}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div id={list._id} onClick={handleViewList} className="card-body align-items-start">
                                    {/* <div className="card-text"><strong className="mr-3">Date of Month billed:</strong>{`${bill.date}`}</div>
                                    <div className="card-text"><strong>Amount:</strong>{` $${bill.amount}`}</div>
                                    <div className="card-text"><strong>Source:</strong>{` ${bill.source}`}</div>
                                        {!bill.automated ? (   
                                                <div></div>
                                            ) : (
                                                <div className="card-text"><strong>Automated</strong></div>
                                            )
                                        } */}
                                    {`${list.itemCount} items on list`}
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