import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import ModalForm from "../Components/ModalForm";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { QUERY_LIST_ITEMS, QUERY_OPTIONS_BY_NAME, QUERY_ITEMS_BY_LIST, QUERY_AREAS } from "../utils/queries";
import { ADD_LIST, DELETE_LIST, EDIT_GROCERY_ITEM, EDIT_LIST, ADD_GROCERY_ITEM } from "../utils/mutations";
import { UPDATE_ACCOUNT_AREAS, UPDATE_ACCOUNT_LISTS, UPDATE_LIST_ITEMS, UPDATE_SEARCHED_OPTIONS } from "../utils/actions";
import auth from "../utils/auth";
import { useParams } from "react-router-dom";
import Login from "./Login";
import Dropdown from 'react-bootstrap/Dropdown';
import { Row, Col, Table } from 'react-bootstrap';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { filterListFromOptions, replaceItemInArray, formatCurrency } from '../utils/helpers';
import CarrotArrow from "../Components/CarrotArrow";
import { useNavigate } from "react-router-dom";
import CheckMarkIcon from "../Components/CheckMarkIcon";


export default function GroceryItemsView() {
    const { listId } = useParams();
    const navigate = useNavigate();
    const [addItemAmount] = useMutation(EDIT_GROCERY_ITEM)
    const [list] = useLazyQuery(QUERY_ITEMS_BY_LIST);
    const [searchField, setSearchField] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const [addAmountId, setAddAmountId] = React.useState("");
    const [addAmountModal, setAddAmountModal] = React.useState(false);
    const [searchedItems] = useLazyQuery(QUERY_OPTIONS_BY_NAME);
    const [addOptionToList] = useMutation(ADD_GROCERY_ITEM);
    const [state, dispatch] = useStoreContext();
    const [showAddList, setShowAddList] = React.useState(false);
    const { data, loading, error } = useQuery(QUERY_AREAS, {
        variables: { accountId: localStorage.getItem('accountId')}
    });
    // const [editList, setEditList] = React.useState(false);    
    // const [addList, setAddList] = React.useState(false);
    // const [addNewList] = useMutation(ADD_LIST);
    // // const [billAdded, setBillAdded] = React.useState();
    // const [deleteList] = useMutation(DELETE_LIST);
    // const [editListPatch] = useMutation(EDIT_LIST);
    // const [billRemoved, setBillRemoved] = React.useState();
    // const [ListEdited, setListEdited] = React.useState();
    // const [editListId, setEditListId] = React.useState();
    
    // const { data: areaData, loading: areaLoading, error: areaError} = useQuery(
    //     QUERY_AREAS, {
    //         variables: { accountId: localStorage.getItem('accountId')}
    //     }
    // )
    
    // const handleEditList = (e) => {
        // const billToEdit = state?.account?.bills?.filter((bill) => bill._id === e.target.id)
        // setEditBillId(() => billToEdit[0]._id)
        // setBillsForm([
        //     {
        //         title: "List Name",
        //         type: "text",
        //         name: "name",
        //         value: billToEdit[0].name,
        //         defaultValue: billToEdit[0].name
        //     },
        //     {
        //         title: "Day of month Due",
        //         type: "text",
        //         name: 'date',
        //         value: billToEdit[0].date,
        //         defaultValue: billToEdit[0].date
        //     },
        //     {
        //         title: "Source",
        //         type: "text",
        //         name: 'source',
        //         value: billToEdit[0].source,
        //         defaultValue: billToEdit[0].source
        //     },
        //     {
        //         title: "Amount",
        //         type: "number",
        //         name: "amount",
        //         value: billToEdit[0].amount,
        //         defaultValue: billToEdit[0].amount
        //     },{
        //         title: "Automated",
        //         type: "checkbox",
        //         name: "automated",
        //         value: !!billToEdit[0].automated ? 'on' : false,
        //         defaultValue: !!billToEdit[0].automated  ? 'on' : false
        //     }
        // ])
        // setEditBill(true);
    // }

    const handleGetList = async () => {
        const groceryList = await list({
            variables: {
                listId: listId
            }
        });
        if(!!groceryList.data.getItemsByList) {
            dispatch({
                type: UPDATE_LIST_ITEMS,
                listItems: groceryList.data.getItemsByList
            })
        }
        console.log(groceryList);
    }

    // const handleOpenModal = () => {
        // setBillsForm([
        //     {
        //         title: "Bill Name",
        //         type: "text",
        //         name: "name",
        //         value: ""
        //     },
        //     {
        //         title: "Day of month Due",
        //         type: "text",
        //         name: 'date',
        //         value: ""
        //     },
        //     {
        //         title: "Source",
        //         type: "text",
        //         name: 'source',
        //         value: ""
        //     },
        //     {
        //         title: "Amount",
        //         type: "number",
        //         name: "amount",
        //         value: "0"
        //     },{
        //         title: "Automated",
        //         type: "checkbox",
        //         name: "automated",
        //         value: false
        //     }
        // ])
        // setAddBill(true)
    // };

    const [amountForm, setAmountForm] = React.useState([
        {
            title: "Amount",
            type: "number",
            name: "amount",
            value: ""
        },
    ]);

    const handleCloseModal = (e) => {
        setAddAmountModal(() => false);
        // setEditList(() => false);
    };

    // const handleViewList = (e) => {
    //     console.log(e.target.id);
    //     if(!!e.target.id) {
    //         navigate("/Bill");
    //     }
    // }

    // const handleDeleteList = async (e) => {
        // const removedBill = await deleteBill({
        //     variables: { _id: `${e.target.id}`, accountId: state?.account?._id}
        // })
        // if(!!removedBill) {
        //     setBillRemoved(e.target.id)
        // }
    // };

    // const handlePatchList = async () => {
    //     const editedList = await editListPatch({
    //         variables: { _id: editListId, name: listForm[0].value, date: listForm[1].value }
    //     });
    //     if(!!editedList) {
    //         setListEdited(editedList.data.editList);
    //         setEditList(false)
    //     }
    // }

    // const handleAddList = async () => {
        // const data = await addNewBill({
        //     variables: { _id: state?.account?._id, name: billsForm[0].value, date: billsForm[1].value, source: billsForm[2].value, amount: parseFloat(billsForm[3].value), automated: billsForm[4].value }
        // })
        // if(!!data) {
        //     setBillAdded(data.data.addBill);
        //     setAddBill(false);
        // }
    // };

    // React.useEffect(() => {
    //     if(!!billAdded) {
    //         const allBills = [
    //             ...state?.account?.bills,
    //             billAdded
    //         ];
    //         dispatch({
    //             type: UPDATE_ACCOUNT_BILLS,
    //             bills: allBills
    //         })
    //     }
    // }, [billAdded]);

    // React.useEffect(() => {
        
    //     if(!!billRemoved) {
    //         const allBills = state?.account?.bills?.filter((bill) => bill._id != billRemoved);
    //         dispatch({
    //             type: UPDATE_ACCOUNT_BILLS,
    //             bills: allBills
    //         });
    //     } else if(!!billEdited) {
    //         const billIndex = state?.account?.bills?.map((bill) => bill._id).indexOf(billEdited._id);
    //         const tempBills = state?.account?.bills?.filter((bill) =>  bill._id != billEdited._id);
    //         const allBills = tempBills.toSpliced(billIndex, 0, billEdited);
    //         dispatch({
    //             type: UPDATE_ACCOUNT_BILLS,
    //             bills: allBills
    //         });
    //     };
        
    //     setBillRemoved(null);
    //     setBillEdited(null);
    // }, [billRemoved, billEdited]);

    // React.useEffect(() => {
    //     if(!!data) {
    //         dispatch({
    //             type: UPDATE_ACCOUNT_LISTS,
    //             lists: data.getLists
    //         });
    //     }
    // }, [data]);

    const handleSearchOptions = async (e) => {
        const searchItems = await searchedItems({
            variables: {
                accountId: localStorage.getItem('accountId'),
                name: !!e?.target?.value ? e.target.value : '',
            }
        });
        if(searchItems.data.getOptionsByName) {
            dispatch({
                type: UPDATE_SEARCHED_OPTIONS,
                searchedOptions: !!state?.listItems?.length ? filterListFromOptions(searchItems.data.getOptionsByName, state.listItems) : searchItems.data.getOptionsByName,
            });
        };
    };

    const sumUpAmounts = (numberArray) => {
        return numberArray?.reduce((acc, num) => acc + num, 0) 
    };

    const handleAddItemToList = async (e) => {
        const selectedItem = state.searchedOptions.find((li) => li._id === e.target.id)
        const itemAdded = await addOptionToList({
            variables: {
                name: selectedItem.name,
                areaId: selectedItem.areaId,
                listId: listId,
                optionId: selectedItem._id,
                amount: 0.00,
            }
        });
        if(!!itemAdded.data.addGroceryItem) {
            dispatch({
                type: UPDATE_LIST_ITEMS,
                listItems: [
                    ...state.listItems,
                    itemAdded.data.addGroceryItem
                ]
            });
            dispatch({
                type: UPDATE_SEARCHED_OPTIONS,
                searchedOptions: state.searchedOptions.filter((so) => so._id !== selectedItem._id)
            })
        }
    }

    const handleAddAmount = async () => {
        const item = state.listItems.find((li) => li._id === addAmountId)
        const updateItemAmount = await addItemAmount({
            variables: {
                ...item,
                amount: parseFloat(amountForm[0].value)
            }
        });
        if(!!updateItemAmount.data.editGroceryItem) {
            dispatch({
                type: UPDATE_LIST_ITEMS,
                listItems: replaceItemInArray(state.listItems, item, updateItemAmount.data.editGroceryItem)
            });
            setAddAmountModal(() => false);

        }
    };

    const handleAddAmountModal = (id) => {
        const item = state.listItems.find((li) => li._id === id)
        setAmountForm([
            {
                title: "Amount",
                type: "number",
                name: "amount",
                value: item.amount
            },
        ]);
        setAddAmountId(id)
    }

    const handleNavigateBack = () => {
        navigate(`/Lists`)
    };

    React.useEffect(() => {
        if(!!listId) {
            handleGetList()
        };
    }, [listId]);

    React.useEffect(() => {
        if(!!addAmountId.length) {
            setAddAmountModal(true);
        }
    }, [addAmountId])

    React.useEffect(() => {
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT_AREAS,
                areas: data.getAreas
            });
        }
    }, [data])

    React.useEffect(() => {
        handleSearchOptions();
    }, [])

    if(auth.loggedIn()) {

        return (
            <>
                {addAmountModal && (
                    <ModalForm 
                        title={'Add Amount'}
                        fields={amountForm}
                        editFields={setAmountForm}
                        submitFunction={handleAddAmount}
                        closeDialog={handleCloseModal}
                    />
                )}
                {showAddList && (
                    <Offcanvas placement="end" show={showAddList} onHide={() => setShowAddList(() => false)}>
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Grocery Options</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <form onChange={handleSearchOptions} className='d-flex align-items-around pt-1' onFocus={() => setIsFocused(() => true)} onBlur={() => setIsFocused(() => false)}>
                                <input id='searchField' name='searchField'></input>
                                <CheckMarkIcon id={'add-list-icon'}/>Add new Option
                            </form>

                            <Table striped bordered hover className="px-3">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Add</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state?.searchedOptions?.map((so) => (
                                        <tr key={so._id} id={so._id}>
                                            <td>{so.name}</td>
                                            <td className="d-flex justify-content-center">
                                                <div id={so._id} onClick={handleAddItemToList}>
                                                    <CheckMarkIcon id={so._id}/>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Offcanvas.Body>
                    </Offcanvas>
                )}
                <Button className='pull-over-button green-color' onClick={() => setShowAddList(() => !showAddList)}>
                    <CarrotArrow isPointingLeft={showAddList} />
                </Button>
                
                <div className="d-flex justify-content-around">
                    <div onClick={handleNavigateBack}>

                        <CarrotArrow isPointingLeft={true} />
                    </div>
                    <h3>{state?.accountLists?.find((al) => al._id === listId).name}</h3>
                    <div>{`Total: ${!!state?.listItems?.length ? formatCurrency(sumUpAmounts(state?.listItems?.map((li) => li.amount ?? 0))) : formatCurrency(0)}`}</div>
                </div>
                <Table striped bordered hover className="px-3">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Area</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!!state?.listItems && state?.listItems?.map((li) => (
                            <tr key={li._id} id={li._id}>
                                <td>{li.name}</td>
                                <td>{state?.areas?.find((a) => a._id === li.areaId)?.name}</td>
                                <td id={li._id} onClick={() => handleAddAmountModal(li._id)}>{formatCurrency(li.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </>
        )
    } else {
        return (
            <Login />
        )
    }
    

};