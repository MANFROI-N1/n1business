
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PhoneCall, CheckCircle, Clock, MessageSquare, User } from "lucide-react";

interface ChannelData {
  id: string;
  name: string;
  icon: React.ReactNode;
  values: {
    chamadas: number;
    atendidas: number;
    minutagem: number;
    simCall: number;
    simWhats: number;
    leadPorPA: number;
  };
}

const URAChannelsTable = () => {
  // Mock data for the table
  const channelsData: ChannelData[] = [
    {
      id: "canal1",
      name: "Canal 1",
      icon: <PhoneCall className="h-4 w-4" />,
      values: {
        chamadas: 5234,
        atendidas: 4543,
        minutagem: 15328,
        simCall: 3412,
        simWhats: 2821,
        leadPorPA: 94,
      },
    },
    {
      id: "canal2",
      name: "Canal 2",
      icon: <PhoneCall className="h-4 w-4" />,
      values: {
        chamadas: 4800,
        atendidas: 3900,
        minutagem: 12000,
        simCall: 2500,
        simWhats: 2000,
        leadPorPA: 75,
      },
    },
    {
      id: "canal3",
      name: "Canal 3",
      icon: <PhoneCall className="h-4 w-4" />,
      values: {
        chamadas: 5200,
        atendidas: 4100,
        minutagem: 18000,
        simCall: 2500,
        simWhats: 2000,
        leadPorPA: 65,
      },
    },
  ];

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-800">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="border-b border-neutral-800">
            <TableHead className="w-[150px] border-r border-neutral-800">CANAIS</TableHead>
            <TableHead className="text-center border-r border-neutral-800">
              <div className="flex items-center justify-center gap-1">
                <PhoneCall className="h-4 w-4" />
                CHAMADAS
              </div>
            </TableHead>
            <TableHead className="text-center border-r border-neutral-800">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" />
                ATENDIDAS
              </div>
            </TableHead>
            <TableHead className="text-center border-r border-neutral-800">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                MINUTAGEM
              </div>
            </TableHead>
            <TableHead className="text-center border-r border-neutral-800">
              <div className="flex items-center justify-center gap-1">
                <PhoneCall className="h-4 w-4" />
                SIM CALL
              </div>
            </TableHead>
            <TableHead className="text-center border-r border-neutral-800">
              <div className="flex items-center justify-center gap-1 text-green-500">
                <MessageSquare className="h-4 w-4" />
                SIM WHT'S
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <User className="h-4 w-4" />
                LEAD POR P.A.
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channelsData.map((channel, index) => (
            <TableRow key={channel.id} className={`border-b border-neutral-800 ${index === channelsData.length - 1 ? 'border-b-0' : ''}`}>
              <TableCell className="font-medium border-r border-neutral-800">
                <div className="flex items-center gap-2">
                  {channel.icon}
                  {channel.name}
                </div>
              </TableCell>
              <TableCell className="text-center border-r border-neutral-800">{channel.values.chamadas.toLocaleString()}</TableCell>
              <TableCell className="text-center border-r border-neutral-800">{channel.values.atendidas.toLocaleString()}</TableCell>
              <TableCell className="text-center border-r border-neutral-800">{channel.values.minutagem.toLocaleString()}</TableCell>
              <TableCell className="text-center border-r border-neutral-800">{channel.values.simCall.toLocaleString()}</TableCell>
              <TableCell className="text-center text-green-500 font-medium border-r border-neutral-800">{channel.values.simWhats.toLocaleString()}</TableCell>
              <TableCell className="text-center">{channel.values.leadPorPA.toLocaleString()}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-neutral-900">
            <TableCell className="font-bold border-r border-neutral-800">TOTAL</TableCell>
            <TableCell className="text-center font-bold border-r border-neutral-800">
              {channelsData.reduce((sum, channel) => sum + channel.values.chamadas, 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-center font-bold border-r border-neutral-800">
              {channelsData.reduce((sum, channel) => sum + channel.values.atendidas, 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-center font-bold border-r border-neutral-800">
              {channelsData.reduce((sum, channel) => sum + channel.values.minutagem, 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-center font-bold border-r border-neutral-800">
              {channelsData.reduce((sum, channel) => sum + channel.values.simCall, 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-center font-bold text-green-500 border-r border-neutral-800">
              {channelsData.reduce((sum, channel) => sum + channel.values.simWhats, 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-center font-bold">
              {channelsData.reduce((sum, channel) => sum + channel.values.leadPorPA, 0).toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default URAChannelsTable;
