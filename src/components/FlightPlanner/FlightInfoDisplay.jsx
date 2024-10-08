import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const FlightInfoDisplay = ({ flightInfo }) => {
  if (!flightInfo) return null;

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>飛行情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div>総距離: {flightInfo.totalDistance} 海里</div>
          <div>総飛行時間: {flightInfo.totalTime}</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>出発</TableHead>
              <TableHead>到着</TableHead>
              <TableHead>距離 (海里)</TableHead>
              <TableHead>磁方位</TableHead>
              <TableHead>所要時間</TableHead>
              <TableHead>到着予定時刻</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flightInfo.legs.map((leg, index) => (
              <TableRow key={index}>
                <TableCell>{leg.from}</TableCell>
                <TableCell>{leg.to}</TableCell>
                <TableCell>{leg.distance}</TableCell>
                <TableCell>{leg.magneticHeading}°</TableCell>
                <TableCell>{leg.ete}</TableCell>
                <TableCell>{leg.eta}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FlightInfoDisplay;