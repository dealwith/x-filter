import React from "react";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const UserSelections = () => {
  return (
    <>
      <Navbar bg="dark text-white" expand="lg">
        <Container>
          <Navbar.Brand className="text-white" href="#">X Filter</Navbar.Brand>
          <Form className="ms-auto">
            <Form.Check
              type="switch"
              id="navbar-switch"
              label="On / Off"
            />
          </Form>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row>
          <Col xs="auto">
            <Form>
              <Form.Check
                type="switch"
                id="body-switch-1"
                label="Ads"
              />
              <Form.Check
                type="switch"
                id="body-switch-2"
                label="Something Else"
              />
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UserSelections;
