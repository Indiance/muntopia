import React, { useState, useEffect, FC } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Navbar from "./Navbar";
import "../css/Conferences.css";

interface ConferenceData {
  id: string;
  name: string;
  address: string;
  conferenceWebsite: string;
  email: string;
}

const Conferences: FC = () => {
  const [data, setData] = useState<ConferenceData[]>([]);

  useEffect(() => {
    const hostingQuery = query(
      collection(db, "organization"),
      where("hostingConference", "==", "Yes"),
    );

    const unsubscribe = onSnapshot(
      hostingQuery,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const results: ConferenceData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          results.push({
            id: doc.id,
            name: data.name,
            address: data.address,
            email: data.email,
            conferenceWebsite: data.conferenceWebsite,
          });
        });
        setData(results);
      },
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>List of Universities Hosting Conferences</h2>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">University</TableCell>
              <TableCell align="center">Address</TableCell>
              <TableCell align="center">Conference Website</TableCell>
              <TableCell align="center">Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="center">{item.name}</TableCell>
                <TableCell align="center">{item.address}</TableCell>
                <TableCell align="center">
                  <a
                    href={item.conferenceWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Conference Link
                  </a>
                </TableCell>
                <TableCell align="center">{item.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Conferences;
