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
    // const listAreas = [];
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
    }

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
    };

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
        setAddAmountId(id);
    };

    const handleNavigateBack = () => {
        navigate(`/Lists`);
    };

    function compare( a, b ) {
        if ( a.name < b.name ){
          return -1;
        }
        if ( a.name > b.name ){
          return 1;
        }
        return 0;
      }
      
    //   objs.sort( compare );

    const [listOrgItems, listOptions, listAreas] = React.useMemo(() => {
        let sortItemsArray = state?.listItems?.map((i) => i);
        let sortOptionsArray = state?.searchedOptions?.map((i) => i);
        let listAreas = []
        state?.listItems?.map((li) => {
            if(!listAreas.includes(li.areaId)) {
                listAreas.push(li.areaId);
            }
            return;
        });
        // let listOrgItems = state?.listItems?.sort((a, b) => (a.areaId > b.areaId ? 1 : -1)) ?? [];
        // let listOptions = state?.searchedOptions?.sort((a, b) => (a.name > b.name ? 1 : -1)) ?? [];
        // if(!!state?.searchedOptions) {
        //     listOptions = state.searchedOptions.sort((a,b)=> (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
        // }
        let listOptions = sortOptionsArray?.sort(compare);
        let listOrgItems = sortItemsArray?.sort(compare)
        return [listOrgItems, listOptions, listAreas];
    }, [state?.listItems, state?.searchedOptions]);

    React.useEffect(() => {
        if(!!listId) {
            handleGetList()
        };
    }, [listId]);

    console.log(state)

    React.useEffect(() => {
        if(!!addAmountId.length) {
            setAddAmountModal(true);
        }
    }, [addAmountId]);

    React.useEffect(() => {
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT_AREAS,
                areas: data.getAreas
            });
        }
    }, [data]);

    React.useEffect(() => {
        handleSearchOptions();
    }, []);

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
                                    {listOptions?.map((so) => (
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
                        {listAreas?.map((la) => (
                            <tbody key={la}>
                                <tr>
                                    <th colSpan={3}>
                                        {state?.areas.find((a) => a._id === la)?.name ?? 'Other'}
                                    </th>
                                </tr>
                                {listOrgItems?.filter((i) => i.areaId === la)?.map((li) => (
                                    <tr key={li._id} id={li._id} className={!!li.amount && 'canceled-cart-item'}>
                                        <td>{li.name}</td>
                                        <td>{state?.areas?.find((a) => a._id === li.areaId)?.name}</td>
                                        <td id={li._id} onClick={() => handleAddAmountModal(li._id)}>{formatCurrency(li.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        ))}
                </Table>
            </>
        )
    } else {
        return (
            <Login />
        )
    }
    

};