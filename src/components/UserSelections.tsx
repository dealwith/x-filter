import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FilterSettings } from "../interfaces/IFilterSettings";
import { userPreferences as defaultPreferences } from "../functions/content";

const UserSelections = () => {
  // Local state to track user preferences
  const [userPreferences, setPreferences] = useState<FilterSettings>(defaultPreferences!);

  // Handler for toggling a preference
  const handleToggle = (key: keyof FilterSettings) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key], // flip boolean value
    }));

    console.log(userPreferences);
  };

  return (
    <>
      <Navbar bg="dark" expand="lg">
        <Container>
          <Navbar.Brand className="text-white" href="#">
            X Filter
          </Navbar.Brand>
          <Form className="ms-auto">
            <Form.Check type="switch" id="navbar-switch" label="On / Off" />
          </Form>
        </Container>
      </Navbar>

      <Container className="mt-4 h-100">
        <Row>
          <Col xs="auto">
            <Form>
              <Form.Check type="switch" id="body-switch-1" label="Political" />
              <Form.Check
                type="switch"
                id="body-switch-2"
                label="Advertisements"
                checked={userPreferences.ads}
                onChange={() => handleToggle('ads')}
                disabled={!userPreferences.enabled}
              />
            </Form>
          </Col>
        </Row>
      </Container>

      {/* Debugging: show current preferences */}
      <pre className="mt-3">{JSON.stringify(userPreferences, null, 2)}</pre>
    </>
  );
};

export default UserSelections;
