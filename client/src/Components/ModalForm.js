import React from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { formFieldCreator } from "../utils/helpers";

export default function ModalForm({title, fields, editFields, closeDialog, submitFunction}) {

    const handleFormChange = (e) => {
        console.log(e)
        const { name, value, type } = e.target;
        const index = fields.map((field) => field.name).indexOf(name);
        
        const newField = fields[index];
        if(type === 'checkbox') {
            newField.value = e.target.checked
        } else {
            newField.value = value;
        }
        
        const newArray = fields;
        newArray[index] = newField
        editFields(newArray);
    }

    return (
        <Modal show={true} onHide={closeDialog}>
            <Modal.Dialog>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onChange={handleFormChange}>
                    {fields.map((field) => (
                        formFieldCreator(field)
                    ))}
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDialog}>Close</Button>
                    <Button variant="primary" onClick={submitFunction}>Save</Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal>
    )
}