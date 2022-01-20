
import React, { useState } from 'react';
import { FormGroup, Form, Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';

const ConductTransactions: React.FC = () => {
    const [recipient, setRecipient] = useState<string>('');
    const [amount, setAmount] = useState(0);

    const history = useHistory();

    const updateRecipient = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecipient(event.target.value);
    };

    const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(event.target.value));
    };

    const transact = async () => {
        try {
            const response = await fetch(`${document.location.origin}/api/transact`, {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ recipient, amount })
            });
            response.json().then((json) => {
                console.log(json.message || json.type);
                history.push('/transaction-pool')
            })
        } catch (e: unknown) {
            console.error(e);
        }
    };

    return (
        <div className='conduct-transaction'>
            <Link to="/">Home</Link>
            <h3>Conduct a Transaction</h3>
            <FormGroup>
                <Form.Control
                    type='text'
                    as="input"
                    placeholder='Recipient'
                    value={recipient}
                    size='sm'
                    onChange={updateRecipient}
                />
            </FormGroup>
            <br />
            <FormGroup>
                <Form.Control
                    type="number"
                    as="input"
                    placeholder='amount'
                    size='lg'
                    value={amount}
                    onChange={updateAmount}
                />
            </FormGroup>
            <br />
            <br />
            <Button
                onClick={transact}
                variant="danger"
                size="lg"
            >
                Submit
            </Button>
        </div>
    )
};

export default ConductTransactions;