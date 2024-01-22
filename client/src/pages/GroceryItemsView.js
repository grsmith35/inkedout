import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import ModalForm from "../Components/ModalForm";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { QUERY_LIST_ITEMS} from "../utils/queries";
import { ADD_LIST, DELETE_LIST, EDIT_LIST } from "../utils/mutations";
import { UPDATE_ACCOUNT_AREAS, UPDATE_ACCOUNT_LISTS } from "../utils/actions";
import auth from "../utils/auth";
import { useParams } from "react-router-dom";
import Login from "./Login";
import Dropdown from 'react-bootstrap/Dropdown';

export default function GroceryItemsView() {
    const { listId } = useParams();
    const [list] = useLazyQuery(QUERY_LIST_ITEMS);
    // const [state, dispatch] = useStoreContext();
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

    // const [listForm, setListForm] = React.useState([
    //     {
    //         title: "List Name",
    //         type: "text",
    //         name: "name",
    //         value: ""
    //     },
    //     {
    //         title: "Areas",
    //         type: "dropdown",
    //         items: (areaLoading ? [{ value: "No options", name: null }] : state.accountAreas),
    //         name: 'area',
    //         value: ""
    //     }
    // ]);

    // const handleCloseModal = (e) => {
    //     setAddList(() => false);
    //     setEditList(() => false);
    // };

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

    React.useEffect(() => {
        if(!!listId) {
            handleGetList()
        }
        
    }, [listId])


    if(auth.loggedIn()) {

        return (
            <>
                List area
            </>
        )
    } else {
        return (
            <Login />
        )
    }
    

};